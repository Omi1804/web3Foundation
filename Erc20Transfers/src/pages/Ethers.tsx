import { useState } from "react";
import provider from "../config/ethers";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { ARB_RPC } from "../../../config";

const Ethers = () => {
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [transferred, setTransferred] = useState(false);

  const handleConnect = async () => {
    if (window?.ethereum && provider) {
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    }
  };

  const getBalance = async () => {
    if (!provider) return;
    try {
      const tokenContractAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
      const contract = new ethers.Contract(
        tokenContractAddress,
        erc20Abi,
        provider
      );

      const balance = await contract.balanceOf(address);
      const formattedBalance = ethers.formatUnits(balance, 6);
      setBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const TransferBalance = async () => {
    if (!provider) return null;

    try {
      const tokenContractAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
      const sigenr = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        tokenContractAddress,
        erc20Abi,
        sigenr
      );

      const amount = ethers.parseUnits("0.0001", 6);

      const tx = await tokenContract.transfer(
        "0x94e46150A8623D5124731F144709DeCe59A68d90",
        amount
      );

      await tx.wait();
      setTransferred(true);
    } catch (error) {
      console.log("Error transferring balance:", error);
    }
  };

  const transferWithoutMetamask = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(ARB_RPC); // make sure you are using correct RPC network url

      const walletPrivatekey = "0xYOUR_PRIVATE";
      const wallet = new ethers.Wallet(walletPrivatekey, provider);

      const tokenContractAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
      const tokenContact = new ethers.Contract(
        tokenContractAddress,
        erc20Abi,
        wallet
      );

      const address = await wallet.getAddress();

      const balance = await tokenContact.balanceOf(address);
      console.log(
        "🚀 ~ transferWithoutMetamask ~ balance:",
        ethers.formatUnits(balance, 6)
      );

      const amount = ethers.parseUnits("0.0001", 6);
      const tx = await tokenContact.transfer(
        "0x94e46150A8623D5124731F144709DeCe59A68d90",
        amount
      );

      await tx.wait();
      setTransferred(true);
    } catch (error) {
      console.log("Error transferring without MetaMask:", error);
    }
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect Wallet</button>
      <button onClick={getBalance}>Get Balance</button>
      <p>{address}</p>
      <p>{balance}</p>

      <button onClick={TransferBalance}>Transfer</button>
      {transferred && (
        <p>Transferred to 0x94e46150A8623D5124731F144709DeCe59A68d90</p>
      )}

      <button onClick={transferWithoutMetamask}>
        Transfer without metamask
      </button>
    </div>
  );
};

export default Ethers;
