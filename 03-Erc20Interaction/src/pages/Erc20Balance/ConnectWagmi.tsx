import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount, useBalance } from "wagmi";

const ConnectWagmi = () => {
  const { address } = useAccount();
  const [tokenBalance, setTokenBalance] = useState<string | undefined>();
  const { data } = useBalance({
    address: address,
    token: "0xE80f295fA22f0c81878729539a3D5d338F580772",
    chainId: 421614,
  });

  const fetchBalance = async () => {
    try {
      setTokenBalance(data?.formatted);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">wagmi + RainbowKit</h1>
      <ConnectButton />
      <div>Connected Account: {address}</div>
      <button className="p-2 m-5 border" onClick={fetchBalance}>
        Fetch Balance
      </button>
      <div>Token Balance: {tokenBalance}</div>
    </div>
  );
};

export default ConnectWagmi;
