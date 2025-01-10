import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ConnectWeb3 from "./pages/Erc20Balance/ConnectWeb3";
import ConnectEthers from "./pages/Erc20Balance/ConnectEthers";
import ConnectWagmi from "./pages/Erc20Balance/ConnectWagmi";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import config from "./utils/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import TransferWeb3 from "./pages/Transfer/TransferWeb3";
import TransferEthers from "./pages/Transfer/TransferEthers";
import TransferWagmi from "./pages/Transfer/TransferWagmi";

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
          <Route path="/balance/web3" element={<ConnectWeb3 />} />
          <Route path="/balance/ethers" element={<ConnectEthers />} />
          <Route path="/balance/wagmi" element={<ConnectWagmi />} />
          <Route path="/transfer/web3" element={<TransferWeb3 />} />
          <Route path="/transfer/ethers" element={<TransferEthers />} />
          <Route path="/transfer/wagmi" element={<TransferWagmi />} />
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
