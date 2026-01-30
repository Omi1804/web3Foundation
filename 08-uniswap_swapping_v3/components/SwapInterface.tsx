"use client";

import { useEffect, useState } from "react";
import TokenSelectModal from "./TokenSelectModal";
import { useAccount, useChainId } from "wagmi";
import { getQuotes } from "@/lib/quoter";
import { useTokenBalances } from "@/hook/useTokenBalances";
import { findTokenBySymbol, getSwapTokens, SwapToken } from "@/lib/tokens";
import { createRoute } from "@/utils/alphaRoute";

export default function SwapInterface() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const activeChainId = chainId;
  const [tokenList, setTokenList] = useState<SwapToken[]>([]);
  const [isTokenListLoading, setIsTokenListLoading] = useState(true);
  const [tokenListError, setTokenListError] = useState<string | null>(null);
  const [fromToken, setFromToken] = useState<SwapToken | null>(null);
  const [toToken, setToToken] = useState<SwapToken | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isFromModalOpen, setIsFromModalOpen] = useState(false);
  const [isToModalOpen, setIsToModalOpen] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const { fromBalance, toBalance, setFromBalance, setToBalance } =
    useTokenBalances(fromToken, toToken);

  useEffect(() => {
    let ignore = false;

    const loadTokens = async () => {
      setIsTokenListLoading(true);
      setTokenListError(null);

      try {
        const tokens = await getSwapTokens(activeChainId);
        if (!ignore) {
          setTokenList(tokens);
        }
      } catch (error) {
        console.error("Error fetching token list:", error);
        if (!ignore) {
          setTokenList([]);
          setTokenListError(
            "Unable to load the Uniswap token list. Please refresh and try again.",
          );
        }
      } finally {
        if (!ignore) {
          setIsTokenListLoading(false);
        }
      }
    };

    loadTokens();

    return () => {
      ignore = true;
    };
  }, [activeChainId]);

  useEffect(() => {
    if (!tokenList.length) {
      return;
    }

    const resolvedFromToken =
      fromToken ?? findTokenBySymbol(tokenList, "WETH") ?? tokenList[0];

    if (!resolvedFromToken) {
      return;
    }

    if (!fromToken) {
      setFromToken(resolvedFromToken);
    }

    if (!toToken) {
      const preferredTo = findTokenBySymbol(tokenList, "USDC");
      const fallbackTo = preferredTo
        ? preferredTo.address !== resolvedFromToken.address
          ? preferredTo
          : tokenList.find(
              (token) => token.address !== resolvedFromToken.address,
            )
        : tokenList.find(
            (token) => token.address !== resolvedFromToken.address,
          );

      setToToken(fallbackTo ?? resolvedFromToken);
    }
  }, [tokenList, fromToken, toToken]);

  // Get quote when fromAmount changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromAmount || parseFloat(fromAmount) === 0) {
        setToAmount("");
        setQuoteError(null);
        return;
      }

      setIsLoadingQuote(true);
      setQuoteError(null);

      try {
        const quote = await getQuotes(fromToken, toToken, fromAmount);
        if (quote) {
          setToAmount(quote);
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
        setQuoteError("Unable to get quote. Pool may not exist.");
        setToAmount("");
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (fromToken && toToken) fetchQuote();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    if (!fromToken || !toToken) {
      return;
    }
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setFromBalance(toBalance);
    setToBalance(fromBalance);
  };

  const handleMaxClick = () => {
    if (!fromToken) {
      return;
    }
    setFromAmount(fromBalance);
  };

  const handelSwap = async () => {
    if (!isConnected || !fromToken || !toToken || !address) {
      return;
    }

    const txRes = await createRoute(
      address || "",
      fromToken,
      toToken,
      Number(fromAmount),
    );
  };

  const swapButtonDisabled =
    !isConnected ||
    !fromAmount ||
    isLoadingQuote ||
    !!quoteError ||
    !fromToken ||
    !toToken ||
    isTokenListLoading ||
    !!tokenListError;

  return (
    <div className="w-full max-w-120 mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4 px-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Swap
          </h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <svg
              className="w-5 h-5 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {tokenListError && (
          <div className="px-4 py-3 mb-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
            {tokenListError}
          </div>
        )}

        <div className="space-y-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                You pay
              </span>
              <button
                onClick={handleMaxClick}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Max
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-3xl font-semibold outline-none text-gray-900 dark:text-white"
              />
              <button
                onClick={() => setIsFromModalOpen(true)}
                className="flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-2xl transition-colors border border-gray-200 dark:border-gray-700"
              >
                {fromToken?.logoURI ? (
                  <img
                    src={fromToken.logoURI}
                    alt={fromToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-neutral-600" />
                )}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {fromToken?.symbol || "Select"}
                </span>
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Balance:
              {fromToken
                ? ` ${parseFloat(fromBalance || "0").toFixed(6)} ${fromToken.symbol}`
                : " –"}
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapTokens}
              className="bg-white dark:bg-gray-900 border-4 border-gray-50 dark:border-gray-950 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                You receive
              </span>
              {isLoadingQuote && (
                <span className="text-xs text-blue-500">Loading...</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={toAmount}
                readOnly
                placeholder="0"
                className="flex-1 bg-transparent text-3xl font-semibold outline-none text-gray-900 dark:text-white"
              />
              <button
                onClick={() => setIsToModalOpen(true)}
                className="flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-2xl transition-colors border border-gray-200 dark:border-gray-700"
              >
                {toToken?.logoURI ? (
                  <img
                    src={toToken.logoURI}
                    alt={toToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-neutral-600" />
                )}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {toToken?.symbol || "Select"}
                </span>
                <svg
                  className="w-4 h-4 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Balance:
              {toToken
                ? ` ${parseFloat(toBalance || "0").toFixed(6)} ${toToken.symbol}`
                : " –"}
            </div>
            {quoteError && (
              <div className="text-sm text-red-500 mt-2">{quoteError}</div>
            )}
          </div>
        </div>

        {fromToken && toToken && fromAmount && toAmount && !quoteError && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Rate</span>
              <span className="text-gray-900 dark:text-white font-medium">
                1 {fromToken.symbol} ={" "}
                {(Number(toAmount) / Number(fromAmount)).toFixed(6)}{" "}
                {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Max slippage
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {slippage}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Network fee
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                ~$2.50
              </span>
            </div>
          </div>
        )}

        <button
          disabled={swapButtonDisabled}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors text-lg"
          onClick={handelSwap}
        >
          {!isConnected
            ? "Connect Wallet"
            : !fromToken || !toToken
              ? "Select tokens"
              : isTokenListLoading
                ? "Loading token list..."
                : !fromAmount
                  ? "Enter an amount"
                  : isLoadingQuote
                    ? "Loading quote..."
                    : quoteError
                      ? "No liquidity available"
                      : tokenListError
                        ? "Token list unavailable"
                        : "Swap"}
        </button>
      </div>

      <TokenSelectModal
        isOpen={isFromModalOpen}
        onClose={() => setIsFromModalOpen(false)}
        onSelectToken={setFromToken}
        tokens={tokenList}
        isLoading={isTokenListLoading}
        error={tokenListError}
      />
      <TokenSelectModal
        isOpen={isToModalOpen}
        onClose={() => setIsToModalOpen(false)}
        onSelectToken={setToToken}
        tokens={tokenList}
        isLoading={isTokenListLoading}
        error={tokenListError}
      />
    </div>
  );
}
