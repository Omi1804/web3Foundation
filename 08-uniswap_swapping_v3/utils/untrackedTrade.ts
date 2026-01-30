// Actual swap logic of the application

import { getPoolInfo } from "@/lib/pool";
import { CurrencyAmount, Token, TradeType, ChainId } from "@uniswap/sdk-core";
import { FeeAmount, Pool, Route, SwapQuoter, Trade } from "@uniswap/v3-sdk";
import { getProvider } from "./provider";
import { ethers } from "ethers";
import { QUOTER_CONTRACT_ADDRESS } from "@/constants/contracts";
import JSBI from "jsbi";
import { fromReadableAmount } from "./convertions";

export const createTrade = async (
  tokenA: Token,
  tokenB: Token,
  amountIn: number,
  poolFee: number = FeeAmount.LOW,
) => {
  const poolInfo = await getPoolInfo(tokenA, tokenB);

  const pool = new Pool(
    tokenA,
    tokenB,
    poolFee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick,
  );

  const swapRoute = new Route([pool], tokenA, tokenB);

  // getting the output amount for the given input amount
  const amountOut = await getOutputQuote(swapRoute, amountIn, tokenA);

  // now as we know the route and amounts, we can create the trade object
  const uncheckedTrade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      tokenA,
      fromReadableAmount(amountIn, tokenA.decimals).toString(),
    ),
    outputAmount: CurrencyAmount.fromRawAmount(tokenB, JSBI.BigInt(amountOut)),
    tradeType: TradeType.EXACT_INPUT,
  });

  return uncheckedTrade;
};

const getOutputQuote = async (
  route: Route<Token, Token>,
  amountIn: number,
  tokenIn: Token,
) => {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No provider");
  }

  const { calldata } = await SwapQuoter.quoteCallParameters(
    route,
    CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(amountIn, tokenIn.decimals).toString(),
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    },
  );

  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  });

  const decoded = ethers.utils.defaultAbiCoder.decode(
    ["uint256", "uint160", "uint32", "uint256"],
    quoteCallReturnData,
  );

  return decoded[0];
};
