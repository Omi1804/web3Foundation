import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "TokenSwap",
  projectId: "6cf84731ea76b63d81c4428ab4ce3d26",
  chains: [base],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        rabbyWallet,
        walletConnectWallet,
        phantomWallet,
      ],
    },
  ],
  ssr: true,
});
