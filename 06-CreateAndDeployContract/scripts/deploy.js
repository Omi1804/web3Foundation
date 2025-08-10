const hre = require("hardhat");

async function main() {
  const NAME = "OmToken";
  const SYMBOL = "OM";
  const initialSupply = hre.ethers.parseUnits("1000000", 18);

  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(NAME, SYMBOL, initialSupply);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("🚀 ~ main ~ address:", address);

  // optional: wait a few confs so Etherscan sees the bytecode
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for 5 confirmations...");
    await token.deploymentTransaction().wait(5);
  }

  // auto-verify
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [NAME, SYMBOL, initialSupply],
    });
    console.log("Verified on Etherscan.");
  } catch (e) {
    console.log("Verification skipped/failed:", e.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
