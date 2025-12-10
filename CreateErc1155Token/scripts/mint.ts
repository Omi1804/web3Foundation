import { network } from "hardhat";

const contractAddress = "0x18e486e25531ff92f66be3fe1c7d35d1999bf93c";

async function main() {
  const { viem } = await network.connect();
  const [walletClient] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  const to = walletClient.account.address as `0x${string}`;

  const tokenId = 1;

  const myGameItems = await viem.getContractAt("MyGameItems", contractAddress);

  /**************************************************************
   🧠 ERC-1155 SUMMARY — READ THIS NEXT TIME YOU RETURN
   ----------------------------------------------------------------
   ✔ ERC-1155 is a **multi-token standard**:
       - A single contract can create many token types (IDs)
       - Each ID behaves like its own mini-collection

   ✔ ERC-1155 tokens are NFT-style by DEFAULT:
       - Wallets & explorers show NFT icon for ALL IDs
       - Because ERC-1155 implements NFT interfaces

   ✔ Fungibility is decided by the **amount**, not the standard:
       - mint(id, amount = 1)   → behaves like ERC721 (unique NFT)
       - mint(id, amount > 1)   → behaves like ERC20 (fungible)
       - mintBatch() can mint multiple IDs at once

   ✔ ERC-1155 CAN imitate ERC-20 behavior but CANNOT create real ERC-20 tokens:
       - Real ERC-20 needs: decimals, totalSupply, allow/approve, transferFrom
       - ERC-1155 does NOT have these → cannot be used as currency on DEX
       - Suitable for: potions, bullets, lootboxes, game currency (local only)

   ✔ ERC-1155 CAN imitate ERC-721 behavior:
       - If amount = 1 → it is a 1/1 NFT
       - If amount > 1 → it is a semi-fungible/ltd-edition NFT

   ✔ Metadata (URI) logic:
       - Base URI points to Pinata folder ending with `/`
       - Final metadata is auto-resolved as: baseURI + tokenId + `.json`
       - Example:
            baseURI = "ipfs://CID/"
            Token ID 1 → "ipfs://CID/1.json"

   ✔ Why MetaMask asks for decimals?
       - ERC-1155 has NO decimals (always integer amounts)
       - So always enter: `0`

   ✔ Why etherscan shows NFT icon?
       - Because ERC-1155 is classified under NFT token type
       - Even if amount = 10 (fungible behavior), explorer still tags it as NFT

   ✔ When to use ERC-1155:
       - Games (weapons, resources, potions, ammo, skins)
       - Metaverse assets
       - Collection editions (10 copies of artwork)
       - Multi-asset systems

   ✔ When NOT to use ERC-1155:
       - For cryptocurrency / governance token → use ERC-20
       - For pure unique art NFTs → ERC-721 (simpler & more tools)
   **************************************************************/

  // -------------------------------------------------------------
  //  MINT #1 — Fungible Mint (Behaves like ERC20)
  // -------------------------------------------------------------
  // Token ID = 1, Amount = 10
  // This behaves like a fungible item (10 identical potions)
  const rawHash = await myGameItems.write.mint([to, BigInt(tokenId), 10n]);
  const txHash = rawHash as unknown as `0x${string}`;
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  console.log(`\n✅ Minted token ${tokenId} (10 units) to ${to}`);
  console.log(`   Transaction hash: ${txHash}`);

  // -------------------------------------------------------------
  //  MINT #2 — Batch Mint (Behaves like ERC721 + ERC20 mixed)
  // -------------------------------------------------------------
  // Token IDs: 1, 2, 3
  // Amounts : 5, 10, 15
  //
  // → ID 1 (5 more units) → fungible
  // → ID 2 (10 units)     → fungible
  // → ID 3 (15 units)     → fungible
  //
  // If you mint with amount = 1 here, ID 2 or ID 3 becomes a UNIQUE NFT.
  await myGameItems.write.mintBatch([to, [1n, 2n, 3n], [5n, 10n, 15n]]);

  console.log(`\n✅ Batch minted tokens [1,2,3] to ${to}`);
  console.log(`   (ID 1: fungible, ID 2: fungible, ID 3: fungible)`);
}

main().catch((error) => {
  console.error("\nDeployment failed:", error);
  process.exitCode = 1;
});
