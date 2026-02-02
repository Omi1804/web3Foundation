import { ethers } from "ethers";

export const getProvider = () => {
  const provider = new ethers.BrowserProvider(window.ethereum as any);
  return provider;
};
