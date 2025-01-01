import { useEffect, useState } from "react";
import provider from "../utils/ethers";

const ConnectEthers = () => {
  const [account, setAccount] = useState<string | null>(null);

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
    </div>
  );
};

export default ConnectEthers;
