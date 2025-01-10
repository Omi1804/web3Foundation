import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { useAccount, useWriteContract } from "wagmi";

const TransferWagmi = () => {
  const { address } = useAccount();
  const { writeContract, status, isSuccess } = useWriteContract();

  const transferWithMetamask = async () => {
    try {
      if (!address) {
        return;
      }
      const tokenAddress = "0xE80f295fA22f0c81878729539a3D5d338F580772";
      const recipientAddress = "0x94e46150A8623D5124731F144709DeCe59A68d90";

      await writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress, ethers.parseUnits("10", 18)],
      });
    } catch (error) {
      console.error("Error transferring wagmi:", error);
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">wagmi + RainbowKit</h1>
      <ConnectButton />
      <button className="p-2 m-5 border" onClick={transferWithMetamask}>
        Transfer with metamask
      </button>
    </div>
  );
};

export default TransferWagmi;
