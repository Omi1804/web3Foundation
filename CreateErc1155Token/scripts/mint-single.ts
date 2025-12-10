import "dotenv/config";
import { network } from "hardhat";
import type { Hex } from "viem";

const ONE = 1n;

function getContractAddress(): `0x${string}` {
  const address = process.env.ERC1155_CONTRACT_ADDRESS?.trim();
  if (!address) {
    throw new Error("Set ERC1155_CONTRACT_ADDRESS in your .env file");
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(
      "ERC1155_CONTRACT_ADDRESS must be a valid 20-byte hex string"
    );
  }

  return address as `0x${string}`;
}

function getRecipient(defaultAddress: string): string {
  const recipient = process.env.MINT_TO?.trim() ?? defaultAddress;
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
    throw new Error("MINT_TO must be a valid Ethereum address");
  }

  return recipient;
}

function getTokenId(): bigint {
  const tokenId = process.env.MINT_TOKEN_ID?.trim();
  if (!tokenId) return 1n;

  const parsed = BigInt(tokenId);
  if (parsed < 0n) {
    throw new Error("MINT_TOKEN_ID must be non-negative");
  }
  return parsed;
}

async function main() {
  const contractAddress = getContractAddress();
  const { viem } = await network.connect();
  const [walletClient] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  if (!walletClient) {
    throw new Error("No wallet client available. Set PRIVATE_KEY in .env");
  }

  const to = getRecipient(walletClient.account.address) as `0x${string}`;
  const tokenId = getTokenId();

  console.log("\nMint parameters");
  console.log(`  Contract : ${contractAddress}`);
  console.log(`  Minter   : ${walletClient.account.address}`);
  console.log(`  Recipient: ${to}`);
  console.log(`  Token ID : ${tokenId}`);
  console.log(`  Amount   : ${ONE}`);

  const myGameItems = await viem.getContractAt("MyGameItems", contractAddress);
  const rawHash = await myGameItems.write.mint([to, tokenId, ONE]);
  const txHash = rawHash as unknown as Hex;
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  console.log(`\n✅ Minted token ${tokenId} to ${to}`);
  console.log(`   Transaction hash: ${txHash}`);
}

main().catch((error) => {
  console.error("\nMint failed:", error);
  process.exitCode = 1;
});
