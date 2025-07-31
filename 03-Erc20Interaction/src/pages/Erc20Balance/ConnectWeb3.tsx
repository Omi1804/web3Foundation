import { useEffect, useState } from "react";
import { getWeb3 } from "../../utils/web3";
import Web3 from "web3";
import { erc20Abi } from "viem";

const ConnectWeb3 = () => {
  const [accounts, setAccounts] = useState<string[] | undefined>([]);
  const [tokenBalance, setTokenBalance] = useState<string | undefined>();

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

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
        setAccounts(newAccounts);
      });
    }
  }, []);

  const fetchErc20Balance = async () => {
    if (accounts === undefined || accounts.length === 0) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      //reading balance of erc20 token in arbitrum sepolia chain
      const provider = new Web3.providers.HttpProvider(
        "https://arbitrum-sepolia.infura.io/v3/20381ad547034bab9d596630a5f60df5"
      );
      const web3 = new Web3(provider);
      const contractAddress = "0xE80f295fA22f0c81878729539a3D5d338F580772";
      const contract = new web3.eth.Contract(erc20Abi, contractAddress);
      const balance = (await contract.methods
        .balanceOf(accounts[0])
        .call()) as number;
      const formattedBalance = web3.utils.fromWei(balance, "ether");
      setTokenBalance(formattedBalance);
      console.log("🚀 ~ fetchErc20Balance ~ balance:", formattedBalance);
    } catch (error) {
      console.log("Error fetching balance:", error);
    }
  };

  return (
    <div>
      Connected Account:{" "}
      {accounts !== undefined && accounts.length > 0 ? accounts[0] : "None"}
      <button className="border p-2 m-5" onClick={fetchErc20Balance}>
        Fetch Balance
      </button>
      <div>Token Balance: {tokenBalance}</div>
    </div>
  );
};

export default ConnectWeb3;
