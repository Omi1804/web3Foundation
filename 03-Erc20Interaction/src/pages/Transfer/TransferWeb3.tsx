import { useEffect, useState } from "react";
import { getWeb3 } from "../../utils/web3";
import Web3 from "web3";
import { erc20Abi } from "viem";

const TransferWeb3 = () => {
  const [accounts, setAccounts] = useState<string[] | undefined>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const web3 = await getWeb3();
        const userAccounts = await web3?.eth.getAccounts();
        setAccounts(userAccounts);
      } catch (error) {
        console.error("User denied account access:", error);
      }
    };

    fetchAccounts();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
        setAccounts(newAccounts);
      });
    }
  }, []);

  const transferERC20 = async () => {
    // In this transfer of ERC20 token, i dont need to RPC url as i am using metamask wallet to sign the transaction and send it
    if (accounts === undefined || accounts.length === 0) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      const accounts = (await web3?.eth.getAccounts()) as string[];
      const senderAddress = accounts[0];

      if (!senderAddress) {
        alert("Please connect your wallet first.");
        return;
      }

      const tokenContractAddress = "0xE80f295fA22f0c81878729539a3D5d338F580772";
      // Create ERC20 token contract instance
      const tokenContract = new web3.eth.Contract(
        erc20Abi,
        tokenContractAddress
      );

      const recepientAddress = "0x94e46150A8623D5124731F144709DeCe59A68d90";
      const amount = web3?.utils.toWei("100", "ether");

      //contructing the transaction
      const transaction = tokenContract.methods.transfer(
        recepientAddress,
        amount
      );
      const gas = await transaction.estimateGas({ from: senderAddress });
      const gasPrice = await web3.eth.getGasPrice();

      const tx = {
        from: senderAddress,
        to: tokenContractAddress,
        gas: gas,
        gasPrice: gasPrice,
        data: transaction.encodeABI(),
      };

      const signedTx = await web3?.eth.sendTransaction(tx);
      console.log("🚀 ~ transferERC20 ~ signedTx:", signedTx);
      alert("Transaction sent successfully");
    } catch (error) {
      console.log("Error fetching balance:", error);
    }
  };

  const transferERC20WithoutMetamask = async () => {
    //In this as we are not using metamask, hence we need to provide the RPC url and private key of the wallet to comunicate to the ethereum blockchain node

    if (accounts === undefined || accounts.length === 0) {
      alert("Please connect your wallet first.");
      return;
    }
    try {
      const provider = new Web3.providers.HttpProvider(
        "https://arbitrum-sepolia.infura.io/v3/20381ad547034bab9d596630a5f60df5"
      );

      const tokenContractAddress = "0xE80f295fA22f0c81878729539a3D5d338F580772";

      const walletPrivateKey =
        "0x837c9c3be902540a4baac64f2d0d218296ce8dbbe4321c867fc710de525ad252";

      const web3 = new Web3(provider);
      const fromAccount = web3.eth.accounts.wallet.add(walletPrivateKey);
      console.log(
        "🚀 ~ transferERC20WithoutMetamask ~ fromAccount:",
        fromAccount[0].address
      );
      const tokenContract = new web3.eth.Contract(
        erc20Abi,
        tokenContractAddress
      );

      const amount = web3.utils.toWei("10", "ether");
      const tx = await tokenContract.methods
        .transfer(accounts[0], amount)
        .send({ from: fromAccount[0].address });
      console.log(`Transaction Hash: ${tx.transactionHash}`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      Connected Account:{" "}
      {accounts !== undefined && accounts.length > 0 ? accounts[0] : "None"}
      <button onClick={transferERC20} className="p-2 m-5 border">
        Transfer with metamask
      </button>
      <button onClick={transferERC20WithoutMetamask} className="p-2 m-5 border">
        Transfer without metamask
      </button>
    </div>
  );
};

export default TransferWeb3;
