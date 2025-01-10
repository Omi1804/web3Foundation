import { useEffect, useState } from "react";
import provider from "../../utils/ethers";
import { erc20Abi } from "viem";
import { ethers } from "ethers";
import { JsonRpcSigner } from "ethers";

const TransferEthers = () => {
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

  const transferERC20WithMetamask = async () => {
    try {
      if (!account) {
        return;
      }

      const tokenContractAddress = "0xE80f295fA22f0c81878729539a3D5d338F580772";
      const signer = (await provider?.getSigner()) as JsonRpcSigner;

      const contract = new ethers.Contract(
        tokenContractAddress,
        erc20Abi,
        signer //connected signer with contract here only (otherwise here provider can also be come)
      );

      const amount = ethers.parseUnits("10", 18);

      // if contract is not connected with signer then we have to connect it in transaction
      // const tx = await contract
      //   .connect(signer)
      //   .transfer("0x94e46150A8623D5124731F144709DeCe59A68d90", amount);

      const tx = await contract.transfer(
        "0x94e46150A8623D5124731F144709DeCe59A68d90",
        amount
      );

      await tx.wait();
      console.log("Transfer successful");
    } catch (error) {
      console.error("Error transferring ERC20 token:", error);
    }
  };

  const transferERC20WithoutMetamask = async () => {
    try {
      if (!account) {
        return;
      }

      const walletPrivateKey =
        "0x837c9c3be902540a4baac64f2d0d218296ce8dbbe4321c867fc710de525ad252";
      const tokenContractAddress = "0xE80f295fA22f0c81878729539a3D5d338F580772";
      const provider = new ethers.JsonRpcProvider(
        "https://arbitrum-sepolia.infura.io/v3/20381ad547034bab9d596630a5f60df5"
      );
      const wallet = new ethers.Wallet(walletPrivateKey, provider);
      const contract = new ethers.Contract(
        tokenContractAddress,
        erc20Abi,
        wallet
      );

      const amount = ethers.parseUnits("10", 18);
      const tx = await contract.transfer(account, amount);
      await tx.wait();
      console.log("Transfer successful");
    } catch (error) {
      console.error("Error transferring ERC20 token:", error);
    }
  };

  return (
    <div className="p-4 text-center space-y-5">
      <h1 className="text-2xl">ethers.js Connection</h1>
      {account ? (
        <p>Connected Account: {account || "Not Connected"}</p>
      ) : (
        <button onClick={handleConect} className="border p-2">
          Connect Wallet
        </button>
      )}
      <button onClick={transferERC20WithMetamask} className="p-2 m-5 border">
        Transfer with metamask
      </button>
      <button onClick={transferERC20WithoutMetamask} className="p-2 m-5 border">
        Transfer without metamask
      </button>
    </div>
  );
};

export default TransferEthers;
