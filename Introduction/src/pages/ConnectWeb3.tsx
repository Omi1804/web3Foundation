import { useEffect, useState } from "react";
import { getWeb3 } from "../utils/web3";

const ConnectWeb3 = () => {
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
  return (
    <div>
      Connected Account:{" "}
      {accounts !== undefined && accounts.length > 0 ? accounts[0] : "None"}
    </div>
  );
};

export default ConnectWeb3;
