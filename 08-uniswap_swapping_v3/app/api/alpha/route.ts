export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  ChainId,
  CurrencyAmount,
  Percent,
  Token,
  TradeType,
} from "@uniswap/sdk-core";
import {
  AlphaRouter,
  SwapOptionsSwapRouter02,
  SwapType,
} from "@uniswap/smart-order-router";
import { ethers } from "ethers";
import JSBI from "jsbi";

// const RPC_URL = process.env.BASE_RPC_URL!;
const RPC_URL =
  "https://base-mainnet.infura.io/v3/20381ad547034bab9d596630a5f60df5";

const getProvider = async () => {
  if (!RPC_URL) throw new Error("RPC URL missing");
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL, {
    name: "base",
    chainId: ChainId.BASE,
  });

  await provider.getNetwork();
  return provider;
};

function fromReadableAmount(amount: number, decimals: number): JSBI {
  const extraDigits = Math.pow(10, countDecimals(amount));
  const adjustedAmount = amount * extraDigits;
  return JSBI.divide(
    JSBI.multiply(
      JSBI.BigInt(adjustedAmount),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals)),
    ),
    JSBI.BigInt(extraDigits),
  );
}

function countDecimals(x: number) {
  if (Math.floor(x) === x) {
    return 0;
  }
  return x.toString().split(".")[1].length || 0;
}

export async function createAlphaRoute({
  tokenIn,
  tokenOut,
  amountIn,
  recipient,
}: {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: number;
  recipient: string;
}) {
  const provider = await getProvider();

  const router = new AlphaRouter({
    chainId: ChainId.BASE,
    provider,
  });

  const options: SwapOptionsSwapRouter02 = {
    recipient,
    slippageTolerance: new Percent(50, 10_000), // 0.5%
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };

  const rawTokenAmountIn: JSBI = fromReadableAmount(amountIn, tokenIn.decimals);

  const route = await router.route(
    CurrencyAmount.fromRawAmount(tokenIn, rawTokenAmountIn),
    tokenOut,
    TradeType.EXACT_INPUT,
    options,
  );

  if (!route || !route.methodParameters) {
    throw new Error("No route found");
  }

  return {
    calldata: route.methodParameters.calldata,
    value: route.methodParameters.value,
    quote: route.quote.toExact(),
    gasEstimateUSD: route.estimatedGasUsedUSD?.toExact(),
    rawAmountIn: rawTokenAmountIn.toString(),
  };
}

type RouteRequestBody = {
  tokenIn: {
    address: string;
    decimals: number;
    symbol?: string;
    chainId: ChainId;
  };
  tokenOut: {
    address: string;
    decimals: number;
    symbol?: string;
    chainId: ChainId;
  };
  amountIn: number;
  recipient: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RouteRequestBody;
    if (!body?.tokenIn || !body?.tokenOut || !body?.recipient) {
      return NextResponse.json(
        { error: "tokenIn, tokenOut and recipient are required" },
        { status: 400 },
      );
    }

    const tokenIn = new Token(
      body.tokenIn.chainId,
      body.tokenIn.address,
      body.tokenIn.decimals,
      body.tokenIn.symbol,
    );
    const tokenOut = new Token(
      body.tokenOut.chainId,
      body.tokenOut.address,
      body.tokenOut.decimals,
      body.tokenOut.symbol,
    );

    const route = await createAlphaRoute({
      tokenIn,
      tokenOut,
      amountIn: body.amountIn,
      recipient: body.recipient,
    });

    return NextResponse.json(route);
  } catch (error) {
    console.error("Failed to create alpha route", error);
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
