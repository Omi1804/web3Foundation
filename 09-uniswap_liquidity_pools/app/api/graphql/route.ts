import { NextResponse } from "next/server";

const GRAPH_URL = `https://gateway.thegraph.com/api/subgraphs/id/43Hwfi3dJSoGpyas9VwNoDAv55yjgGrPpNSmbQZArzMG`;

export async function POST() {
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.THE_GRAPH_API_KEY}`,
    },
    body: JSON.stringify({
      query: `
        query GetPools {
            pools(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc) {
                id
                feeTier
                liquidity
                sqrtPrice
                tick
                token0 {
                    id
                    symbol
                    name
                    decimals
                  derivedETH
                }
                token1 {
                    id
                    symbol
                    name
                    decimals
                  derivedETH
                }
                totalValueLockedUSD
                volumeUSD
            }
              bundles(first: 1) {
               id
               ethPriceUSD
          }
        }
        `,
    }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
