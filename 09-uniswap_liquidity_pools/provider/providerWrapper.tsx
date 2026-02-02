"use client";
import "@rainbow-me/rainbowkit/styles.css";
import config from "@/config/wagmiConfig";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default ProviderWrapper;
