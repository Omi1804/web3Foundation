import { ethers } from "ethers";

export function verifyMessageOffchain(message: string, signer: any) {
  try {
    const recovered = ethers.verifyMessage(message, signer);
    return recovered;
  } catch (error) {
    console.error("Verify failed", error);
    return null;
  }
}

export async function verifyOnChain({
  contractAddress,
  abi,
  signer,
  message,
  signature,
  expectedSigner,
}: {
  contractAddress: string;
  abi: any;
  signer: ethers.Signer;
  message: string;
  signature: string;
  expectedSigner: string;
}): Promise<boolean> {
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const result = await contract.verify(expectedSigner, message, signature);
  return result;
}
