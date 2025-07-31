import { useEffect, useState } from "react";
import provider from "../../utils/ethers";
import { ethers } from "ethers";
import { erc20Abi } from "viem";

const ConnectEthers = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | undefined>();

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

  const fetchBalance = async () => {
    try {
      if (!account) {
        return;
      }

      //fetching token balance from arbitrum sepolia
      const tokenContractAddress = "0xE80f295fA22f0c81878729539a3D5d338F580772";
      const contract = new ethers.Contract(
        tokenContractAddress,
        erc20Abi,
        provider
      );
      const balance = await contract.balanceOf(account);
      const formattedBalance = ethers.formatUnits(balance, 18);
      setTokenBalance(formattedBalance);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-4 text-center">
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
      <button onClick={fetchBalance} className="p-2 m-5 border">
        Fetch Balance
      </button>
      <p>
        Token Balance:{" "}
        {tokenBalance ? tokenBalance : "Please connect your wallet first."}
      </p>
    </div>
  );
};

export default ConnectEthers;
