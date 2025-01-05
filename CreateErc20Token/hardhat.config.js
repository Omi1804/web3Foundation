require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    arbitrum: {
      url: "https://arbitrum-mainnet.infura.io/v3/20381ad547034bab9d596630a5f60df5", // Arbitrum One mainnet
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrumSepolia: {
      url: "https://arbitrum-sepolia.infura.io/v3/20381ad547034bab9d596630a5f60df5", // Arbitrum Goerli testnet
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
