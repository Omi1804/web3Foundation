import { useEffect, useState } from "react";
import { getWeb3 } from "../utils/web3";

const ConnectWeb3 = () => {
  const [accounts, setAccounts] = useState<string[] | undefined>([]);
  const [balance, setBalance] = useState<string | null>(null);

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

  const findEthBalance = async () => {
    if (!accounts || accounts?.length <= 0) return;

    const web3 = await getWeb3();
    const balance = await web3?.eth.getBalance(accounts[0]);
    if (balance) {
      const formattedBalance = web3?.utils.fromWei(balance, "ether");
      console.log("🚀 ~ findEthBalance ~ formattedBalance:", formattedBalance);
      setBalance(formattedBalance || null);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center flex-col">
      Connected Account:{" "}
      {accounts !== undefined && accounts.length > 0 ? accounts[0] : "None"}
      <br />
      {balance !== null ? (
        `Balance: ${balance}`
      ) : (
        <button onClick={findEthBalance} className="p-2 border text-black">
          Find Eth balance...
        </button>
      )}
    </div>
  );
};

export default ConnectWeb3;
