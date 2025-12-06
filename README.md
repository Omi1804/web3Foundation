# Web3 Foundation Learning Repository

A comprehensive collection of Web3 development tutorials and examples demonstrating blockchain interaction, smart contract development, and dApp creation using modern Web3 technologies.

## 📋 Overview

This repository contains a series of progressive learning projects that cover fundamental to advanced Web3 development concepts. Each project is self-contained and builds upon previous concepts, providing hands-on experience with blockchain technologies, smart contracts, and decentralized applications.

## 🗂️ Project Structure

### Frontend/dApp Projects (React + TypeScript + Vite)

1. **01-Introduction**
   - Basic Web3 wallet connection setup
   - Introduction to Web3 libraries (ethers.js, web3.js, wagmi)
   - RainbowKit integration for wallet connectivity

2. **02-AccountInfo**
   - Fetching and displaying blockchain account information
   - Multi-chain balance checking (Ethereum, Arbitrum)
   - Comparison of different Web3 libraries (ethers.js, web3.js, wagmi)

3. **03-Erc20Interaction**
   - Interacting with ERC20 token contracts
   - Reading token balances and metadata
   - Web3 contract interaction patterns

4. **04-Erc20Transfers**
   - Implementing ERC20 token transfers
   - Transaction handling and confirmations
   - Error handling in Web3 transactions

5. **05-Erc20Approve&Listen**
   - ERC20 token approval mechanism
   - Event listening and real-time updates
   - Advanced contract interaction patterns

### Smart Contract Projects (Hardhat)

6. **06-CreateAndDeployContract**
   - Basic Hardhat project setup
   - Smart contract compilation and deployment
   - Testing smart contracts

7. **CreateErc20Token**
   - Creating custom ERC20 tokens
   - OpenZeppelin ERC20 implementation
   - Token deployment scripts

8. **CreateErc721Token**
   - Creating NFT (ERC721) contracts
   - NFT minting functionality
   - Metadata and token URI management
   - Hardhat 3 Beta with TypeScript and Viem

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Ethers.js** - Ethereum library
- **Web3.js** - Alternative Ethereum library
- **Viem** - TypeScript Ethereum library

### Smart Contracts
- **Hardhat** - Development environment
- **Solidity** - Smart contract language
- **OpenZeppelin Contracts** - Secure contract implementations
- **Hardhat Toolbox** - Testing and deployment tools

## 🚀 Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git**
- A Web3 wallet (e.g., MetaMask)
- Basic understanding of JavaScript/TypeScript
- Familiarity with React (for frontend projects)
- Familiarity with Solidity (for smart contract projects)

## 📦 Installation

### For Frontend Projects (01-05)

```bash
# Navigate to the project directory
cd <project-name>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### For Smart Contract Projects (06, CreateErc20Token, CreateErc721Token)

```bash
# Navigate to the project directory
cd <project-name>

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy contracts (local network)
npx hardhat ignition deploy ignition/modules/<ModuleName>.js
```

## 💡 Usage

### Getting Started with dApps

1. **Start with 01-Introduction** to set up wallet connectivity
2. **Progress to 02-AccountInfo** to learn about account data retrieval
3. **Move to 03-Erc20Interaction** to interact with existing tokens
4. **Practice with 04-Erc20Transfers** to perform token operations
5. **Master 05-Erc20Approve&Listen** for advanced patterns

### Getting Started with Smart Contracts

1. **Begin with 06-CreateAndDeployContract** for Hardhat basics
2. **Explore CreateErc20Token** to create fungible tokens
3. **Learn CreateErc721Token** to build NFT contracts

### Running a Project

Each frontend project can be run independently:

```bash
cd 01-Introduction
npm install
npm run dev
```

Access the application at `http://localhost:5173` (or the port shown in terminal)

### Deploying Smart Contracts

For smart contract projects:

```bash
cd CreateErc20Token
npm install
npx hardhat compile
npx hardhat test
npx hardhat node  # Start local blockchain
# In another terminal
npx hardhat ignition deploy ignition/modules/YourModule.js --network localhost
```

## 📚 Learning Path

### Beginner
1. Complete the Introduction project
2. Understand wallet connections and basic Web3 interactions
3. Learn to read blockchain data (AccountInfo)

### Intermediate
1. Master ERC20 token interactions
2. Implement token transfers and approvals
3. Create your first smart contract (ERC20)

### Advanced
1. Build NFT contracts (ERC721)
2. Implement event listening and real-time updates
3. Deploy contracts to testnets
4. Integrate smart contracts with frontend dApps

## 🔧 Configuration

### Environment Variables

Some projects may require environment variables. Create a `.env` file in the project root:

```env
# For smart contract projects
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here

# For frontend projects
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

**⚠️ Important**: Never commit your `.env` file or expose private keys!

## 📖 Resources

### Official Documentation
- [Ethereum](https://ethereum.org/developers)
- [Hardhat](https://hardhat.org/docs)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [Ethers.js](https://docs.ethers.org/)
- [Wagmi](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Viem](https://viem.sh/)

### Learning Resources
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Learn](https://docs.openzeppelin.com/learn/)
- [Ethereum Development Tutorials](https://ethereum.org/en/developers/tutorials/)

## 🤝 Contributing

Contributions are welcome! If you'd like to improve these examples or add new tutorials:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-tutorial`)
3. Commit your changes (`git commit -m 'Add amazing tutorial'`)
4. Push to the branch (`git push origin feature/amazing-tutorial`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes. Individual libraries and frameworks are subject to their respective licenses.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the individual project READMEs for specific instructions
2. Review the official documentation for the technologies used
3. Open an issue in this repository

## ⚠️ Disclaimer

These projects are for educational purposes only. Always conduct thorough testing before deploying smart contracts to mainnet. Never share your private keys or commit them to version control.

---

**Happy Learning! 🚀**
