import { ethers } from "ethers";

let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;

if (window.ethereum) {
  provider = new ethers.BrowserProvider(window.ethereum);
} else {
  provider = new ethers.JsonRpcProvider("https://1rpc.io/eth");
}

export default provider;
