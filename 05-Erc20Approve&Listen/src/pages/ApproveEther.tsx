import { useState } from "react";
import provider from "../utils/ethers";
import { ethers } from "ethers";
import erc20Abi from "../../../erc20Abi.json";

const Ethers = () => {
  const [account, setAccount] = useState<string | null>(null);

  const handleConnect = async () => {
    if (window.ethereum && provider) {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    }
  };

  const handleApproveSpending = async () => {
    if (!provider) return;

    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const tokenContractAddress = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

      const tokenContract = new ethers.Contract(
        tokenContractAddress,
        erc20Abi,
        signer
      );

      const balance = await tokenContract.balanceOf(address);

      const amount = ethers.parseUnits("1", 6);

      if (amount > balance) {
        alert("Amount is greater than balance");
      } else {
        const spender = "0x9F42d304C49240fc7B9E2356A859f1653Dd8c6d5";
        const tx = await tokenContract.approve(spender, amount);
        tx.wait();
      }
    } catch (error) {
      console.error("Error approving spending:", error);
    }
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect Wallet</button>
      <div>Ethereum Account: {account}</div>

      <button onClick={handleApproveSpending}>Approve Balance</button>
    </div>
  );
};

export default Ethers;
