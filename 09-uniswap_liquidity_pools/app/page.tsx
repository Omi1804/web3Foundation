"use client";
import { Navbar } from "@/components/Navbar";
import { PoolOverview } from "@/components/PoolOverview";
import { useFetchPools } from "@/hook/useFetchPools";
import { buildMintCall } from "@/utils/uniswapMint";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  buildSdkPool,
  getCenteredRangeTicks,
  getFullRangeTicks,
} from "@/utils/uniswapSdkPool";
import { CurrencyAmount, Percent } from "@uniswap/sdk-core";
import { Position } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { useMemo, useState } from "react";
import { approveToken } from "@/utils/approval";
import { POSITION_MANAGER } from "@/constants/contracts";
import { toRaw } from "@/utils/convertions";
import { RangeSelector } from "@/components/RangeSelector";
import { LiquidityInputs } from "@/components/LiquidityInputs";

const CHAIN_ID_BASE = 8453;

const Page = () => {
  const { pools, selectedPoolId, setSelectedPoolId, ethPriceUSD } =
    useFetchPools();
  const selectedPool = pools.find((pool) => pool.id === selectedPoolId);

  const [mode, setMode] = useState<"full" | "concentrated">("full");
  const [draftPct, setDraftPct] = useState<number>(10);
  const [appliedPct, setAppliedPct] = useState<number>(10);

  const [depositMode, setDepositMode] = useState<"token0" | "token1" | "both">(
    "token0",
  );
  const [deposit0, setDeposit0] = useState("0.1");
  const [deposit1, setDeposit1] = useState("200");
  const [slippagePct, setSlippagePct] = useState("0.5");
  const [deadlineMinutes, setDeadlineMinutes] = useState("20");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const sdkPool = selectedPool
    ? buildSdkPool(CHAIN_ID_BASE, selectedPool)
    : null;

  const sdkPriceToken0 = sdkPool ? sdkPool.token0Price.toSignificant(6) : null;
  const sdkPriceToken1 = sdkPool ? sdkPool.token1Price.toSignificant(6) : null;

  const parsedSlippage = Number(slippagePct);
  const isSlippageValid =
    Number.isFinite(parsedSlippage) &&
    parsedSlippage > 0 &&
    parsedSlippage < 100;

  const slippageTolerance = useMemo(() => {
    if (!isSlippageValid) return null;
    return new Percent(Math.round(parsedSlippage * 100), 10_000);
  }, [isSlippageValid, parsedSlippage]);

  const parsedDeadline = Number(deadlineMinutes);
  const isDeadlineValid = Number.isFinite(parsedDeadline) && parsedDeadline > 0;

  const deadlineTimestamp = useMemo(() => {
    if (!isDeadlineValid) return null;
    return Math.floor(Date.now() / 1000) + Math.round(parsedDeadline * 60);
  }, [isDeadlineValid, parsedDeadline]);

  const deadlineReadable = useMemo(() => {
    if (!deadlineTimestamp) return null;
    return new Date(deadlineTimestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [deadlineTimestamp]);

  const range = useMemo(() => {
    if (!sdkPool || !selectedPool || selectedPool.tick === null) return null;

    if (mode === "full") {
      return getFullRangeTicks(selectedPool.tickSpacing);
    }

    return getCenteredRangeTicks(
      selectedPool.tick,
      selectedPool.tickSpacing,
      appliedPct,
    );
  }, [sdkPool, selectedPool, mode, appliedPct]);

  const position = useMemo(() => {
    if (!sdkPool || !selectedPool || !range) return null;

    const raw0 = toRaw(deposit0, sdkPool.token0.decimals);
    const raw1 = toRaw(deposit1, sdkPool.token1.decimals);

    try {
      if (depositMode === "token0") {
        return Position.fromAmount0({
          pool: sdkPool,
          tickLower: range.tickLower,
          tickUpper: range.tickUpper,
          amount0: raw0,
          useFullPrecision: true,
        });
      }

      if (depositMode === "token1") {
        return Position.fromAmount1({
          pool: sdkPool,
          tickLower: range.tickLower,
          tickUpper: range.tickUpper,
          amount1: raw1,
        });
      }

      return Position.fromAmounts({
        pool: sdkPool,
        tickLower: range.tickLower,
        tickUpper: range.tickUpper,
        amount0: raw0,
        amount1: raw1,
        useFullPrecision: true,
      });
    } catch (error) {
      console.error("Error creating position:", error);
      return null;
    }
  }, [sdkPool, selectedPool, range, deposit0, deposit1, depositMode]);

  const mintAmountsWithSlippage = useMemo(() => {
    if (!position || !slippageTolerance) return null;
    try {
      return position.mintAmountsWithSlippage(slippageTolerance);
    } catch (error) {
      console.error("Error computing mint amounts with slippage:", error);
      return null;
    }
  }, [position, slippageTolerance]);

  const mintCall = useMemo(() => {
    if (!position || !slippageTolerance || !deadlineTimestamp) return null;

    const recipient = address || "0x000000000000000000000000000000000000dEaD";

    try {
      return buildMintCall({
        position,
        slippageTolerance,
        deadline: deadlineTimestamp,
        recipient,
      });
    } catch (e) {
      console.error("Mint calldata error", e);
      return null;
    }
  }, [position, slippageTolerance, deadlineTimestamp, address]);

  const minAmountsDisplay = useMemo(() => {
    if (!mintAmountsWithSlippage || !sdkPool) return null;
    return {
      token0: CurrencyAmount.fromRawAmount(
        sdkPool.token0,
        mintAmountsWithSlippage.amount0,
      ).toSignificant(6),
      token1: CurrencyAmount.fromRawAmount(
        sdkPool.token1,
        mintAmountsWithSlippage.amount1,
      ).toSignificant(6),
    };
  }, [mintAmountsWithSlippage, sdkPool]);

  const isDraftPctValid = draftPct > 0 && draftPct < 99;

  const applyConcentrated = () => {
    if (!isDraftPctValid) return;
    setAppliedPct(draftPct);
    setMode("concentrated");
  };

  const inRange =
    selectedPool &&
    range &&
    selectedPool.tick !== null &&
    selectedPool.tick >= range.tickLower &&
    selectedPool.tick < range.tickUpper;

  const useFullRange = () => setMode("full");

  const handleMint = async () => {
    if (
      !isConnected ||
      !walletClient ||
      !address ||
      !mintCall ||
      !position ||
      !sdkPool ||
      !mintAmountsWithSlippage
    ) {
      alert("Wallet or pool not ready");
      return;
    }

    if (chainId !== CHAIN_ID_BASE) {
      alert("Please switch to Base network");
      return;
    }

    const provider = new ethers.BrowserProvider(walletClient.transport, "any");
    const signer = await provider.getSigner();

    try {
      const needsToken0Approval = JSBI.greaterThan(
        mintAmountsWithSlippage.amount0,
        JSBI.BigInt(0),
      );
      if (needsToken0Approval) {
        await approveToken(
          sdkPool.token0.address,
          mintAmountsWithSlippage.amount0,
          signer,
        );
      }

      const needsToken1Approval = JSBI.greaterThan(
        mintAmountsWithSlippage.amount1,
        JSBI.BigInt(0),
      );
      if (needsToken1Approval) {
        await approveToken(
          sdkPool.token1.address,
          mintAmountsWithSlippage.amount1,
          signer,
        );
      }

      const tx = await signer.sendTransaction({
        to: POSITION_MANAGER,
        data: mintCall.calldata,
        value: BigInt(mintCall.value || "0x0"),
      });

      console.log("Mint tx sent:", tx.hash);
      await tx.wait();
      alert("Liquidity position minted 🎉");
    } catch (err) {
      console.error("Mint failed", err);
      alert("Mint failed — check console");
    }
  };

  return (
    <div className="h-full min-h-screen">
      <Navbar />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-20 space-y-4">
        <div className="flex gap-4 items-end text-white mx-auto">
          <PoolOverview
            pools={pools}
            selectedPoolId={selectedPoolId}
            onSelectPool={setSelectedPoolId}
            selectedPool={selectedPool}
            ethPriceUSD={ethPriceUSD}
            position={position}
            sdkPriceToken0={sdkPriceToken0}
            sdkPriceToken1={sdkPriceToken1}
          />

          <div className="flex items-center gap-4 flex-col">
            <LiquidityInputs
              sdkPool={sdkPool}
              depositMode={depositMode}
              setDepositMode={setDepositMode}
              deposit0={deposit0}
              setDeposit0={setDeposit0}
              deposit1={deposit1}
              setDeposit1={setDeposit1}
              slippagePct={slippagePct}
              setSlippagePct={setSlippagePct}
              isSlippageValid={isSlippageValid}
              deadlineMinutes={deadlineMinutes}
              setDeadlineMinutes={setDeadlineMinutes}
              isDeadlineValid={isDeadlineValid}
              deadlineReadable={deadlineReadable}
            />

            {/* Range */}
            <div className="border-white/10 border rounded-xl p-4 max-w-2xl w-full bg-gray-900/60 text-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Range Selector
                  </p>
                  <p className="text-2xl font-semibold capitalize">
                    {mode === "full" ? "Full Range" : "Concentrated Range"}
                  </p>
                </div>
                {range && (
                  <span className="text-xs font-semibold text-gray-200 bg-white/10 rounded-full px-3 py-1">
                    {range.tickLower} → {range.tickUpper}
                  </span>
                )}
              </div>

              <RangeSelector
                draftPct={draftPct}
                setDraftPct={setDraftPct}
                applyConcentrated={applyConcentrated}
                isDraftPctValid={isDraftPctValid}
                useFullRange={useFullRange}
              />

              <div className="text-xs text-gray-300 space-y-1">
                <p>
                  Mode:{" "}
                  {mode === "full"
                    ? "Full-range liquidity"
                    : `±${appliedPct / 2}% band`}
                </p>
                {mode === "concentrated" && (
                  <p>Applied Percentage: {appliedPct}%</p>
                )}
                <p>Status: {inRange ? "✅ In range" : "❌ Out of range"}</p>
              </div>

              {!isDraftPctValid && (
                <p className="text-xs text-red-300">
                  Enter a value between 1% and 99% to stay within Uniswap
                  bounds.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          {/* Result */}
          {position && range && (
            <div className="border-white/10 border rounded-xl p-6 w-full bg-gray-900/60 text-white space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold tracking-wide text-gray-300 uppercase">
                  Position Summary
                </p>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    inRange
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-red-500/20 text-red-200"
                  }`}
                >
                  {inRange ? "In Range" : "Out of Range"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Ticks</p>
                  <p className="font-semibold">
                    {range.tickLower} → {range.tickUpper}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Liquidity</p>
                  <p className="font-mono text-sm break-all">
                    {position.liquidity.toString()}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Token0 Used</p>
                  <p className="font-semibold">
                    {position.amount0.toSignificant(6)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Token1 Used</p>
                  <p className="font-semibold">
                    {position.amount1.toSignificant(6)}
                  </p>
                </div>
                {minAmountsDisplay && (
                  <>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">
                        Min token0 (slippage)
                      </p>
                      <p className="font-semibold">
                        {minAmountsDisplay.token0}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">
                        Min token1 (slippage)
                      </p>
                      <p className="font-semibold">
                        {minAmountsDisplay.token1}
                      </p>
                    </div>
                  </>
                )}
                {deadlineTimestamp && (
                  <div className="bg-white/5 rounded-lg p-3 sm:col-span-2">
                    <p className="text-gray-400 text-xs">Deadline</p>
                    <p className="font-mono text-sm">
                      {deadlineTimestamp}{" "}
                      {deadlineReadable && `· ${deadlineReadable}`}
                    </p>
                  </div>
                )}
                {mintCall && (
                  <div className="border border-white/10 rounded-xl p-6 w-full bg-gray-900/60 text-white space-y-3 mx-auto col-span-2">
                    <p className="text-sm font-semibold uppercase text-gray-300">
                      Mint Transaction (Preview)
                    </p>

                    <div className="text-xs break-all">
                      <p className="text-gray-400">Calldata</p>
                      <p className="font-mono">{mintCall.calldata}</p>
                    </div>

                    <div className="text-xs">
                      <p className="text-gray-400">ETH Value</p>
                      <p className="font-mono">{mintCall.value}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {mintCall && isConnected && (
          <button
            onClick={handleMint}
            className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition text-white font-semibold text-lg"
          >
            Mint Liquidity Position
          </button>
        )}

        {!isConnected && (
          <p className="text-xs text-gray-400 text-center">
            Connect wallet to mint position
          </p>
        )}
        <p className="text-gray-300 text-xs max-w-2xl mx-auto">
          Choose concentrated liquidity to provide depth around a target price
          and earn higher fees, or stay full-range to capture volume across
          every tick with lower capital efficiency.
        </p>
      </main>
    </div>
  );
};

export default Page;
