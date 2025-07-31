import Web3 from "web3";

// Initializing web3
let web3: Web3 | null = null;

const getWeb3 = () => {
  if (web3) return web3;

  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error("User denied account access");
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    console.log(
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    );
  }
};

export { getWeb3, web3 };
