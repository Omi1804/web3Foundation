import { QUOTER_CONTRACT_ADDRESS } from "@/constants/contracts";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { getProvider } from "../utils/provider";
import { ethers } from "ethers";
import { FeeAmount } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";

export const getQuotes = async (
  tokenIn: Token | null,
  tokenOut: Token | null,
  inputAmount: string,
  poolFee: number = FeeAmount.LOW,
) => {
  if (!tokenIn || !tokenOut) {
    return null;
  }
  const provider = getProvider();

  if (!provider) {
    throw new Error("No provider");
  }

  if (!inputAmount || parseFloat(inputAmount) === 0) {
    return null;
  }

  const quoterContract = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    provider,
  );

  try {
    // QuoterV2 uses quoteExactInputSingle with a struct parameter
    const params = {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      fee: poolFee,
      amountIn: ethers.utils.parseUnits(inputAmount, tokenIn.decimals),
      sqrtPriceLimitX96: 0,
    };

    const quotedAmountOut =
      await quoterContract.callStatic.quoteExactInputSingle(params);

    // QuoterV2 returns an object with amountOut and other fields
    const amountOut = quotedAmountOut.amountOut || quotedAmountOut;

    return ethers.utils.formatUnits(amountOut, tokenOut.decimals);
  } catch (error) {
    console.error("Error getting quote:", error);
    throw error;
  }
};
