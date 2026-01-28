"use client";

import { ethers } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { getProvider } from "./provider";
import { V3_SWAP_ROUTER_ADDRESS } from "../constants/contracts";
import { erc20Abi } from "viem";

export const createRoute = async (
  walletAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: number,
) => {
  const res = await fetch("http://localhost:3000/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokenIn,
      tokenOut,
      amountIn,
    }),
  });

  const data = await res.json();
  const { calldata, value } = data;

  if (!res.ok) {
    throw new Error("Failed to fetch swap route");
  }

  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  // 3️⃣ Approve token
  const tokenContract = new ethers.Contract(tokenIn.address, erc20Abi, signer);

  const approveAmount = ethers.utils.parseUnits(
    amountIn.toString(),
    tokenIn.decimals,
  );

  // const approveTx = await tokenContract.approve(
  //   V3_SWAP_ROUTER_ADDRESS,
  //   approveAmount,
  // );
  const approveTx = await tokenContract.approve(
    V3_SWAP_ROUTER_ADDRESS,
    ethers.constants.MaxUint256,
  );
  await approveTx.wait();

  const txValue = value ?? "0x0";

  const gasEstimation = await signer.estimateGas({
    to: V3_SWAP_ROUTER_ADDRESS,
    from: walletAddress,
    data: calldata,
    value: txValue,
  });

  // 4️⃣ Execute swap
  const tx = await signer.sendTransaction({
    to: V3_SWAP_ROUTER_ADDRESS,
    data: calldata,
    value: txValue,
    gasLimit: gasEstimation.mul(120).div(100), // adding 20% buffer
    maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
    maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei"),
    from: walletAddress,
  });

  await tx.wait();
  return tx;
};
