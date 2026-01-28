import { ethers } from "ethers";
import { base } from "wagmi/chains";
import { config } from "./wagmi";

const defaultChain = config.chains[0] ?? base;

let browserExtensionProvider: ethers.providers.Web3Provider | null = null;

export const getProvider = (): ethers.providers.Web3Provider => {
  browserExtensionProvider ??= createBrowserExtensionProvider();
  return browserExtensionProvider;
};

const createBrowserExtensionProvider = (): ethers.providers.Web3Provider => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No browser extension wallet found");
  }

  return new ethers.providers.Web3Provider(
    window.ethereum as ethers.providers.ExternalProvider,
    defaultChain.id,
  );
};
