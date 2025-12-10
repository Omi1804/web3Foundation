import "dotenv/config";
import { network } from "hardhat";

type DeploymentInputs = {
  name: string;
  symbol: string;
  baseUri: string;
};

const DEFAULTS: DeploymentInputs = {
  name: "My Game Items",
  symbol: "MGI",
  baseUri:
    "https://brown-numerous-flamingo-176.mypinata.cloud/ipfs/bafybeigs2vhj7kg7uh4beqybf55rmmczzfdm2whjnrka6w2qa2ff3xqbi4/",
};

function buildDeploymentInputs(): DeploymentInputs {
  const name = process.env.GAME_ITEMS_NAME?.trim() || DEFAULTS.name;
  const symbol = process.env.GAME_ITEMS_SYMBOL?.trim() || DEFAULTS.symbol;
  const baseUri = process.env.GAME_ITEMS_BASE_URI?.trim() || DEFAULTS.baseUri;

  if (!baseUri.endsWith("/")) {
    throw new Error(
      "GAME_ITEMS_BASE_URI must end with '/' because the contract appends <id>.json"
    );
  }

  return { name, symbol, baseUri };
}

async function main() {
  const deploymentInputs = buildDeploymentInputs();
  const { viem } = await network.connect();
  const [walletClient] = await viem.getWalletClients();

  if (!walletClient) {
    throw new Error(
      "No wallet client available. Set PRIVATE_KEY in .env to deploy on Sepolia."
    );
  }

  console.log("\nDeploying MyGameItems with:");
  console.log(`  Deployer: ${walletClient.account.address}`);
  console.log(`  Name     : ${deploymentInputs.name}`);
  console.log(`  Symbol   : ${deploymentInputs.symbol}`);
  console.log(`  Base URI : ${deploymentInputs.baseUri}`);

  const contract = await viem.deployContract("MyGameItems", [
    deploymentInputs.name,
    deploymentInputs.symbol,
    deploymentInputs.baseUri,
  ]);

  console.log("\n✅ MyGameItems deployed");
  console.log(`   Address : ${contract.address}`);
}

main().catch((error) => {
  console.error("\nDeployment failed:", error);
  process.exitCode = 1;
});
