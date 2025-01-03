import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";

const ConnectWagmi = () => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<number | null>(null);

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">wagmi + RainbowKit</h1>

      {isConnected ? <p>Connected Account: {address}</p> : <ConnectButton />}

      {isConnected ? (
        balance ? (
          <button className="p-2 border">Fetch Balance</button>
        ) : (
          <p>Balance: {balance}</p>
        )
      ) : (
        <p>Connect your account to fetch balance</p>
      )}
    </div>
  );
};

export default ConnectWagmi;
