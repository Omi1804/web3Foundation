import { Pool } from "@/hook/useFetchPools";

type RawToken = {
  id: string;
  symbol: string;
  name: string;
  decimals: string;
  derivedETH?: string | null;
};

export type RawPool = {
  id: string;
  feeTier: string;
  liquidity: string;
  sqrtPrice?: string | null;
  tick?: string | null;
  token0: RawToken;
  token1: RawToken;
  totalValueLockedUSD?: string | null;
  volumeUSD?: string | null;
};

function computePriceFromSqrt(
  sqrtPriceX96: bigint,
  decimals0: number,
  decimals1: number,
) {
  const sqrt = Number(sqrtPriceX96.toString()); // UI only
  const price = (sqrt * sqrt) / 2 ** 192;
  return price * 10 ** (decimals0 - decimals1);
}

export function toNumber(value?: string | null): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getTickSpacing(feeTier: number) {
  switch (feeTier) {
    case 100:
      return 1;
    case 200:
      return 2;
    case 250:
      return 5;
    case 400:
      return 8;
    case 500:
      return 10;
    case 750:
      return 15;
    case 1000:
      return 20;
    case 2500:
      return 50;
    case 3000:
      return 60;
    case 4000:
      return 80;
    case 5000:
      return 100;
    case 10000:
      return 200;
    default:
      console.log("Unsupported fee tier:", feeTier);
      throw new Error("Unsupported fee tier");
  }
}

export function normalizePool(pool: RawPool, ethPriceUSD: number | null): Pool {
  const feeTierNum = toNumber(pool.feeTier) ?? 0;
  const tickSpacing = getTickSpacing(feeTierNum);

  const rawTick = toNumber(pool.tick ?? null);

  const liquidity = pool.liquidity ? BigInt(pool.liquidity) : BigInt(0);
  const sqrtPriceX96 = pool.sqrtPrice ? BigInt(pool.sqrtPrice) : null;

  const token0DecimalsRaw = Number(pool.token0.decimals ?? "0");
  const token1DecimalsRaw = Number(pool.token1.decimals ?? "0");
  const token0Decimals = Number.isFinite(token0DecimalsRaw)
    ? token0DecimalsRaw
    : 0;
  const token1Decimals = Number.isFinite(token1DecimalsRaw)
    ? token1DecimalsRaw
    : 0;

  const token0DerivedETH = toNumber(pool.token0.derivedETH ?? null);
  const token1DerivedETH = toNumber(pool.token1.derivedETH ?? null);

  const token0USD =
    token0DerivedETH !== null && ethPriceUSD !== null
      ? token0DerivedETH * ethPriceUSD
      : null;

  const token1USD =
    token1DerivedETH !== null && ethPriceUSD !== null
      ? token1DerivedETH * ethPriceUSD
      : null;

  const priceToken1PerToken0 =
    sqrtPriceX96 !== null &&
    Number.isFinite(token0Decimals) &&
    Number.isFinite(token1Decimals)
      ? computePriceFromSqrt(sqrtPriceX96, token0Decimals, token1Decimals)
      : null;

  const priceToken0PerToken1 =
    priceToken1PerToken0 !== null && priceToken1PerToken0 !== 0
      ? 1 / priceToken1PerToken0
      : null;

  return {
    id: pool.id,
    feeTier: feeTierNum,
    tickSpacing,
    tick: rawTick,
    liquidity,
    sqrtPriceX96,
    token0: {
      id: pool.token0.id,
      symbol: pool.token0.symbol,
      name: pool.token0.name,
      decimals: token0Decimals,
      derivedETH: token0DerivedETH,
      derivedUSD: token0USD,
    },
    token1: {
      id: pool.token1.id,
      symbol: pool.token1.symbol,
      name: pool.token1.name,
      decimals: token1Decimals,
      derivedETH: token1DerivedETH,
      derivedUSD: token1USD,
    },
    prices: {
      sqrtPrice: {
        token1PerToken0: priceToken1PerToken0,
        token0PerToken1: priceToken0PerToken1,
      },
      derivedEth: {
        token0USD,
        token1USD,
      },
    },
    totalValueLockedUSD: toNumber(pool.totalValueLockedUSD ?? null),
    volumeUSD: toNumber(pool.volumeUSD ?? null),
  };
}
