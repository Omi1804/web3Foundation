import hre from "hardhat";

async function main() {
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = await MyNFT.deploy();
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log("NFT deployed address:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
