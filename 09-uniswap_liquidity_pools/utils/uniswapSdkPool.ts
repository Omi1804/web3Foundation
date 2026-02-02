import { Token } from "@uniswap/sdk-core";
import { nearestUsableTick, Pool } from "@uniswap/v3-sdk";
import JSBI from "jsbi";

const MIN_TICK = -887272;
const MAX_TICK = 887272;

type NormalizedPool = {
  id: string;
  feeTier: number;
  tickSpacing: number;
  tick: number | null;
  liquidity: bigint;
  sqrtPriceX96: bigint | null;
  token0: { id: string; decimals: number; symbol: string; name: string };
  token1: { id: string; decimals: number; symbol: string; name: string };
};

export function buildSdkPool(chainId: number, p: NormalizedPool): Pool | null {
  if (!p.sqrtPriceX96 || p.tick === null) return null;

  const token0 = new Token(
    chainId,
    p.token0.id,
    p.token0.decimals,
    p.token0.symbol,
    p.token0.name,
  );
  const token1 = new Token(
    chainId,
    p.token1.id,
    p.token1.decimals,
    p.token1.symbol,
    p.token1.name,
  );

  return new Pool(
    token0,
    token1,
    p.feeTier,
    JSBI.BigInt(p.sqrtPriceX96.toString()),
    JSBI.BigInt(p.liquidity.toString()),
    p.tick,
  );
}

const LOG_BASE = Math.log(1.0001);

// function priceToTick(price: number) {
//   // as price = 1.0001 ^ tick  =>  tick = log(price) / log(1.0001)
//   return Math.floor(Math.log(price) / Math.log(1.0001));
// }

export function getFullRangeTicks(tickSpacing: number) {
  // Here we are using the min and max ticks just like uniswap v2 to represent full range and add liquidity everywhere
  return {
    tickLower: nearestUsableTick(MIN_TICK, tickSpacing),
    tickUpper: nearestUsableTick(MAX_TICK, tickSpacing),
  };
}

// Currently this ony includes the ranges in whcih current price is centered (always included) and hence we always needs to add both tokens as liquidity, to make it such that only one token is needed we would need to adjust the range calculation and make it such that range can be set in which current price is not centered or parts of.
export function getCenteredRangeTicks(
  currentTick: number,
  tickSpacing: number,
  percentage: number,
) {
  // Here we calculate the lower and upper tick bounds based on the given percentage and only add liquidity within that range
  const pct = percentage / 200; // divide by 200 to get half on each side

  const lowerDelta = Math.log(1 - pct) / LOG_BASE;
  const upperDelta = Math.log(1 + pct) / LOG_BASE;

  const minUsable = nearestUsableTick(MIN_TICK, tickSpacing);
  const maxUsable = nearestUsableTick(MAX_TICK, tickSpacing);

  const rawLower = currentTick + lowerDelta;
  const rawUpper = currentTick + upperDelta;

  let tickLower = clampToBounds(
    Math.floor(rawLower / tickSpacing) * tickSpacing,
    minUsable,
    maxUsable,
  );

  let tickUpper = clampToBounds(
    Math.ceil(rawUpper / tickSpacing) * tickSpacing,
    minUsable,
    maxUsable,
  );

  if (tickUpper <= tickLower) {
    tickLower = clampToBounds(tickLower - tickSpacing, minUsable, maxUsable);
    tickUpper = clampToBounds(tickLower + tickSpacing, minUsable, maxUsable);
  }

  return { tickLower, tickUpper };
}

function clampToBounds(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
