import { Percent, Token, TradeType } from "@uniswap/sdk-core";
import { SwapRouter, Trade, SwapOptions } from "@uniswap/v3-sdk";
import { getProvider } from "./provider";
import { erc20Abi } from "viem";
import { ethers } from "ethers";
import {
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  SWAP_ROUTER_ADDRESS,
} from "@/constants/contracts";

export type TokenTrade = Trade<Token, Token, TradeType>;

export const executeTrade = async (
  tokenA: Token,
  tokenB: Token,
  amountIn: string,
  trade: TokenTrade,
  walletAddress: string,
) => {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No provider available");
  }

  if (!walletAddress) {
    throw new Error("No wallet connected");
  }

  if (!amountIn || Number(amountIn) <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  validateTradeTokens(trade, tokenA, tokenB);

  const signer = provider.getSigner(walletAddress);

  const slippageTolerance = new Percent(50, 10_000);

  const rawApprovalAmount =
    trade.tradeType === TradeType.EXACT_INPUT
      ? trade.inputAmount.quotient
      : trade.maximumAmountIn(slippageTolerance).quotient;

  await getTokenTransferApproval(
    tokenA,
    walletAddress,
    rawApprovalAmount.toString(),
  );

  //here we setting how much slippage and time we give for the trade to execute
  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: walletAddress,
  };

  const methodParameters = SwapRouter.swapCallParameters([trade], options);

  const txRequest: ethers.providers.TransactionRequest = {
    data: methodParameters.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: methodParameters.value,
    from: walletAddress,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  };

  try {
    await signer.estimateGas({ ...txRequest });
  } catch (error) {
    console.log(error);
  }

  const response = await signer.sendTransaction({
    ...txRequest,
  });

  return response;
};

const getTokenTransferApproval = async (
  token: Token,
  walletAddress: string,
  amount: string,
) => {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No provider available");
  }

  const signer = provider.getSigner(walletAddress);
  const contract = new ethers.Contract(token.address, erc20Abi, signer);
  const requiredAmount = ethers.BigNumber.from(amount);

  const currentAllowance = await contract.allowance(
    walletAddress,
    SWAP_ROUTER_ADDRESS,
  );

  if (currentAllowance.gte(requiredAmount)) {
    return null;
  }

  const approvalTx = await contract.approve(
    SWAP_ROUTER_ADDRESS,
    requiredAmount,
  );
  await approvalTx.wait();

  return approvalTx;
};

const validateTradeTokens = (
  trade: TokenTrade,
  inputToken: Token,
  outputToken: Token,
) => {
  const inputMatches =
    trade.inputAmount.currency.address.toLowerCase() ===
    inputToken.address.toLowerCase();

  const outputMatches =
    trade.outputAmount.currency.address.toLowerCase() ===
    outputToken.address.toLowerCase();

  if (!inputMatches || !outputMatches) {
    throw new Error("Trade tokens do not match the selected tokens");
  }
};
