import { POSITION_MANAGER } from "@/constants/contracts";
import { ethers } from "ethers";
import JSBI from "jsbi";

export async function approveToken(
  tokenAddress: string,
  amount: JSBI,
  signer: ethers.Signer,
) {
  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
  ];

  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const tx = await contract.approve(
    POSITION_MANAGER,
    // BigInt(amount.toString()),
    ethers.MaxUint256,
  );
  return tx.wait();
}
