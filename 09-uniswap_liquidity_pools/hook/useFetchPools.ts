import { normalizePool, RawPool, toNumber } from "@/utils/normalisePools";
import { useEffect, useState } from "react";

const SAFE_MIN_TVL = 10_000;

type PoolToken = {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  derivedETH: number | null;
  derivedUSD: number | null;
};

export type Pool = {
  id: string;
  feeTier: number;
  tickSpacing: number;
  tick: number | null;
  liquidity: bigint;
  sqrtPriceX96: bigint | null;
  token0: PoolToken;
  token1: PoolToken;
  prices: {
    sqrtPrice: {
      token1PerToken0: number | null;
      token0PerToken1: number | null;
    };
    derivedEth: {
      token0USD: number | null;
      token1USD: number | null;
    };
  };
  totalValueLockedUSD: number | null;
  volumeUSD: number | null;
};

export const useFetchPools = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [ethPriceUSD, setEthPriceUSD] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/graphql", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error("Unable to fetch pools");
        }

        const data = await res.json();
        const poolData: RawPool[] = data?.data?.pools ?? [];
        const ethPrice: number | null = toNumber(
          data?.data?.bundles?.[0]?.ethPriceUSD ?? null,
        );

        const normalizedPools = poolData
          .map((pool) => normalizePool(pool, ethPrice))
          .filter(
            (pool) =>
              pool.liquidity > BigInt(0) &&
              (pool.totalValueLockedUSD ?? 0) > SAFE_MIN_TVL,
          );

        setPools(normalizedPools);
        setSelectedPoolId((current) => current || normalizedPools[0]?.id || "");
        setEthPriceUSD(ethPrice);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return { pools, selectedPoolId, setSelectedPoolId, ethPriceUSD };
};
