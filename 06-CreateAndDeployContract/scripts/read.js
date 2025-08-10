// scripts/read.js
const hre = require("hardhat");

async function main() {
  const tokenAddress = "0xc6D41b5c7d64Fb25D27A5d008De97c63291E9c2E";
  const holder = "0x7B5C40aB02D16e2Ca43D466ADF5e3002b436c857";

  const token = await hre.ethers.getContractAt("MyToken", tokenAddress);

  const [name, symbol, decimals, totalSupply, holderBal] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply(),
    token.balanceOf(holder),
  ]);

  console.log({
    name,
    symbol,
    decimals: Number(decimals),
    totalSupply: hre.ethers.formatUnits(totalSupply, decimals),
    holderBalance: hre.ethers.formatUnits(holderBal, decimals),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
