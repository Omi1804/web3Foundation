// after deploying the token now its time to transfer the token's contract
const hre = require("hardhat");

async function main() {
  const tokenAddress = "0xc6D41b5c7d64Fb25D27A5d008De97c63291E9c2E";
  const recipientAddress = "0x9F42d304C49240fc7B9E2356A859f1653Dd8c6d5";
  const amount = "10";

  const token = await hre.ethers.getContractAt("MyToken", tokenAddress);

  const decimals = await token.decimals();
  const value = hre.ethers.parseUnits(amount, decimals);

  const tx = await token.transfer(recipientAddress, value);
  console.log("transfer tx:", tx.hash);
  await tx.wait();
  console.log(`Sent ${amount} tokens to ${recipientAddress}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
