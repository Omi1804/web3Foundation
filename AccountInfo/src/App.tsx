import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ConnectWeb3 from "./pages/ConnectWeb3";
import ConnectEthers from "./pages/ConnectEthers";
import ConnectWagmi from "./pages/ConnectWagmi";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import config from "./utils/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}

const queryClient = new QueryClient();

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/web3" element={<ConnectWeb3 />} />
          <Route path="/ethers" element={<ConnectEthers />} />
          <Route path="/wagmi" element={<ConnectWagmi />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
