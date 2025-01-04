import { useEffect, useState } from "react";
import provider from "../utils/ethers";
import { ethers, formatEther } from "ethers";
import { ARB_RPC } from "../../../cofing";

const ConnectEthers = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [arbBalance, setArbBalance] = useState<string | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  const handleConect = async () => {
    try {
      if (window.ethereum && provider) {
        //for best practice explicitly request the user to connect to the provider
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } else {
        alert("MetaMask is not installed. Please install it to continue.");
        return;
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const findEthBalance = async () => {
    if (!account || !window.ethereum || !provider) return null;

    const balance = await provider.getBalance(account);
    const formattedBalance = formatEther(balance);
    setBalance(formattedBalance);
    console.log("🚀 ~ findEthBalance ~ balance:", formattedBalance);
  };

  const findBalanceInArbitrum = async () => {
    if (!account || !window.ethereum || !provider) return null;

    const arbProvider = new ethers.JsonRpcProvider(ARB_RPC);
    const balance = await arbProvider.getBalance(account);

    const formattedBalance = formatEther(balance);
    setArbBalance(formattedBalance);
  };

  return (
    <div className="p-4 text-center h-screen flex flex-col justify-center items-center gap-4">
      <h1 className="text-2xl font-bold">ethers.js Connection</h1>
      {account ? (
        <p>Connected Account: {account || "Not Connected"}</p>
      ) : (
        <button
          onClick={handleConect}
          className="text-sm font-black border p-2"
        >
          Connect Wallet
        </button>
      )}
      {balance ? (
        <p>Balance: {balance}</p>
      ) : (
        <button onClick={findEthBalance} className="p-2 border">
          Get Balance
        </button>
      )}
      {arbBalance ? (
        <p>Arbitrum Balance: {arbBalance}</p>
      ) : (
        <button onClick={findBalanceInArbitrum} className="p-2 border">
          Get Arbitrum Balance
        </button>
      )}
    </div>
  );
};

export default ConnectEthers;
