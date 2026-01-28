import { ethers } from "ethers";
import { getProvider } from "../utils/provider";
import { Token } from "@uniswap/sdk-core";

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

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
      return ethers.utils.formatEther(balance);
    }

    // For ERC20 tokens
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider,
    );

    const balance = await tokenContract.balanceOf(userAddress);
    return ethers.utils.formatUnits(balance, decimals);
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
