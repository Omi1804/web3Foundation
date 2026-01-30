import { computePoolAddress, FeeAmount } from "@uniswap/v3-sdk";
import { getProvider } from "../utils/provider";
import { POOL_FACTORY_CONTRACT_ADDRESS } from "@/constants/contracts";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { ethers } from "ethers";
import { Token } from "@uniswap/sdk-core";

// Get pool info for dynamic token pairs
export const getPoolInfo = async (
  tokenA: Token,
  tokenB: Token,
  fee: number = FeeAmount.MEDIUM,
) => {
  const provider = getProvider();

  if (!provider) {
    throw new Error("No provider");
  }

  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA,
    tokenB,
    fee,
  });

  const poolContract = new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    provider,
  );

  const [poolFee, liquidity, tickSpacing, slot0] =
    await Promise.all([
      poolContract.fee(),
      poolContract.liquidity(),
      poolContract.tickSpacing(),
      poolContract.slot0(),
    ]);

  return {
    fee: poolFee, // fee is the fee which is taken on every swap that is executed in the pool
    tickSpacing,
    liquidity, // liquidity is the amount of liquidity in the pool can used for the trade at that price range
    sqrtPriceX96: slot0[0], // current price of the pool encoded as the ratio between the price of token0 and token1
    tick: slot0[1], // tick is current tick price of the pool
  };
};
