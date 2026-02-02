import { Percent } from "@uniswap/sdk-core";
import { NonfungiblePositionManager, Position } from "@uniswap/v3-sdk";

type MintParams = {
  position: Position;
  slippageTolerance: Percent;
  deadline: number;
  recipient: string;
};

export function buildMintCall({
  position,
  slippageTolerance,
  deadline,
  recipient,
}: MintParams) {
  const { calldata, value } = NonfungiblePositionManager.addCallParameters(
    position,
    {
      slippageTolerance,
      deadline,
      recipient,
    },
  );

  return {
    calldata,
    value,
  };
}
