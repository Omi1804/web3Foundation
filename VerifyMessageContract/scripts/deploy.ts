import "dotenv/config";
import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [walletClient] = await viem.getWalletClients();

  if (!walletClient) {
    throw new Error(
      "No wallet client detected. Set PRIVATE_KEY in .env when targeting Sepolia."
    );
  }

  console.log("\nDeploying MessageVerifier...");
  console.log(`  Deployer: ${walletClient.account.address}`);

  const contract = await viem.deployContract("MessageVerifier");

  console.log("\n✅ MessageVerifier deployed");
  console.log(`   Address: ${contract.address}`);
}

main().catch((error) => {
  console.error("\nDeployment failed:", error);
  process.exitCode = 1;
});
