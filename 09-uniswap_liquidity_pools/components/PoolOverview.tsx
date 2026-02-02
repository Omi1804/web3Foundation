import type { Pool } from "@/hook/useFetchPools";
import type { Position } from "@uniswap/v3-sdk";
import { Fragment } from "react";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const ratioFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

const formatCurrency = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }
  return currencyFormatter.format(value);
};

const formatRatio = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }
  return ratioFormatter.format(value);
};

const formatBigint = (value: bigint | null) => {
  if (value === null) {
    return "N/A";
  }
  return value.toString();
};

type PoolOverviewProps = {
  pools: Pool[];
  selectedPoolId: string;
  onSelectPool: (poolId: string) => void;
  selectedPool?: Pool;
  ethPriceUSD: number | null;
  position: Position | null;
  sdkPriceToken0: string | null;
  sdkPriceToken1: string | null;
};

export const PoolOverview = ({
  pools,
  selectedPoolId,
  onSelectPool,
  selectedPool,
  ethPriceUSD,
  position,
  sdkPriceToken0,
  sdkPriceToken1,
}: PoolOverviewProps) => {
  return (
    <div className="flex flex-col gap-8 items-center text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Select Pool</h1>
        <p className="text-gray-200 text-sm">
          Choose a Uniswap pool pair to inspect balances or provide liquidity.
        </p>
        <select
          name="pool"
          id="pool"
          value={selectedPoolId}
          onChange={(event) => onSelectPool(event.target.value)}
          className="rounded p-2 bg-gray-800 text-white min-w-[320px] outline-none"
        >
          <option value="" disabled={Boolean(pools.length)}>
            {pools.length ? "Select a pool" : "Loading pools..."}
          </option>
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.token0.symbol}/{pool.token1.symbol}
              {` - ${(pool.feeTier / 10000).toFixed(2)}%`}
            </option>
          ))}
        </select>
      </div>

      {selectedPool ? (
        <div className="bg-gray-900/60 border border-white/10 rounded-xl p-6 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Pool Overview</h2>
            {ethPriceUSD && (
              <span className="text-sm text-gray-300">
                ETH Price: {formatCurrency(ethPriceUSD)}
              </span>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-400">Token A</dt>
              <dd className="font-medium">
                {selectedPool.token0.symbol} - {selectedPool.token0.name}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Token B</dt>
              <dd className="font-medium">
                {selectedPool.token1.symbol} - {selectedPool.token1.name}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Fee Tier</dt>
              <dd className="font-medium">
                {(selectedPool.feeTier / 10000).toFixed(2)}%
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Pool ID</dt>
              <dd className="font-mono text-xs break-all">{selectedPool.id}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Tick / Spacing</dt>
              <dd className="font-medium">
                {selectedPool.tick ?? "N/A"} / {selectedPool.tickSpacing}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Liquidity (raw)</dt>
              <dd className="font-mono text-xs">
                {formatBigint(selectedPool.liquidity)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Sqrt Price (X96)</dt>
              <dd className="font-mono text-xs break-all">
                {formatBigint(selectedPool.sqrtPriceX96)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">sqrtPrice (token1 / token0)</dt>
              <dd className="font-medium">
                {formatRatio(selectedPool.prices.sqrtPrice.token1PerToken0)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">sqrtPrice (token0 / token1)</dt>
              <dd className="font-medium">
                {formatRatio(selectedPool.prices.sqrtPrice.token0PerToken1)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">
                Token0 USD (derived - {selectedPool.token0.symbol})
              </dt>
              <dd>
                {formatCurrency(selectedPool.prices.derivedEth.token0USD)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">
                Token1 USD (derived - {selectedPool.token1.symbol})
              </dt>
              <dd>
                {formatCurrency(selectedPool.prices.derivedEth.token1USD)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">TVL (USD)</dt>
              <dd>{formatCurrency(selectedPool.totalValueLockedUSD)}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Volume (USD)</dt>
              <dd>{formatCurrency(selectedPool.volumeUSD)}</dd>
            </div>
            <div>
              <dt className="text-gray-400">SDK Price (token1/token0)</dt>
              <dd className="font-medium">{sdkPriceToken0 ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-gray-400">SDK Price (token0/token1)</dt>
              <dd className="font-medium">{sdkPriceToken1 ?? "N/A"}</dd>
            </div>
            {position && (
              <Fragment>
                <div>
                  <dt className="text-gray-400">Position liquidity</dt>
                  <dd className="font-mono">{position.liquidity.toString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Required token0</dt>
                  <dd>{position.amount0.toSignificant(6)}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Required token1</dt>
                  <dd>{position.amount1.toSignificant(6)}</dd>
                </div>
              </Fragment>
            )}
          </dl>
        </div>
      ) : (
        <p className="text-gray-300 text-sm">Pools will appear once loaded.</p>
      )}
    </div>
  );
};
