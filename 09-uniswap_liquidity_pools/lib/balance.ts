import { ethers } from "ethers";
import { getProvider } from "../provider/ethersProvider";
import { Token } from "@uniswap/sdk-core";
import { erc20Abi } from "viem";

export const getTokenBalance = async (
  tokenAddress: string,
  userAddress: string,
  decimals: number,
): Promise<string> => {
  try {
    const provider = getProvider();

    if (!provider || !userAddress) {
      return "0";
    }

    // For native ETH (if needed in the future)
    if (
      tokenAddress === "0x0000000000000000000000000000000000000000" ||
      tokenAddress.toLowerCase() === "eth"
    ) {
      const balance = await provider.getBalance(userAddress);
      return ethers.formatEther(balance);
    }

    // For ERC20 tokens
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

    const balance = await tokenContract.balanceOf(userAddress);
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
};

export const getMultipleTokenBalances = async (
  tokens: Token[],
  userAddress: string,
): Promise<{ [address: string]: string }> => {
  if (!userAddress) {
    return {};
  }

  const balances: { [address: string]: string } = {};

  try {
    const balancePromises = tokens.map((token) =>
      getTokenBalance(token.address, userAddress, token.decimals),
    );

    const results = await Promise.all(balancePromises);

    tokens.forEach((token, index) => {
      balances[token.address] = results[index];
    });

    return balances;
  } catch (error) {
    console.error("Error fetching multiple token balances:", error);
    return {};
  }
};
