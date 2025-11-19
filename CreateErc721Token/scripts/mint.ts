import hre from "hardhat";

const CONTRACT_ADDRESS = "0x294306d6d3362B6496E896c92a79537e66Ea6D00";
const TOKEN_URI =
  "https://brown-numerous-flamingo-176.mypinata.cloud/ipfs/bafkreidb7xd2k2jtwrngpl4fcueffmzcv4ka5fqpfdiviayqzlkkqsnmrm";
const RECIPIENT = "0x7b5c40ab02d16e2ca43d466adf5e3002b436c857";

async function main() {
  // Get the signer (the account that will pay for the transaction)
  const [signer] = await hre.ethers.getSigners();

  // Get the contract's ABI (from the artifacts folder)
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");

  // Connect the signer to the deployed contract
  const myNft = new hre.ethers.Contract(
    CONTRACT_ADDRESS,
    MyNFT.interface,
    signer
  );

  // Call the mintNFT function
  console.log("Minting NFT...");
  const tx = await myNft.mint(RECIPIENT, TOKEN_URI);

  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  console.log("NFT Minted! Transaction Hash:", receipt.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
