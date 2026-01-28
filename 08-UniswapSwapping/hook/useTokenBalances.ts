import { getTokenBalance } from "@/lib/balance";
import { Token } from "@uniswap/sdk-core";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useTokenBalances = (
  fromToken: Token | null,
  toToken: Token | null,
) => {
  const { isConnected, address } = useAccount();
  const [fromBalance, setFromBalance] = useState<string>("0");
  const [toBalance, setToBalance] = useState<string>("0");

  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address || !fromToken || !toToken) {
        setFromBalance("0");
        setToBalance("0");
        return;
      }

      try {
        const fromBal = await getTokenBalance(
          fromToken.address,
          address,
          fromToken.decimals,
        );
        const toBal = await getTokenBalance(
          toToken.address,
          address,
          toToken.decimals,
        );
        setFromBalance(fromBal);
        setToBalance(toBal);
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [isConnected, address, fromToken, toToken]);

  return {
    fromBalance,
    toBalance,
    setFromBalance,
    setToBalance,
  };
};
