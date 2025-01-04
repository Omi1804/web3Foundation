import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";

const ConnectWagmi = () => {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useBalance({ address: address });
  const { data: arbBalace, isLoading: arbLoading } = useBalance({
    address: address,
    chainId: 42161,
  });

  return (
    <div className="p-4 text-center text-black">
      <h1 className="text-2xl font-bold">wagmi + RainbowKit</h1>

      {isConnected ? <p>Connected Account: {address}</p> : <ConnectButton />}

      {isConnected ? (
        isLoading ? (
          <button className="p-2 border">Loading...</button>
        ) : (
          <p>Balance: {data?.formatted}</p>
        )
      ) : (
        <p>Connect your account to fetch balance</p>
      )}
      {
        // Arbitrum Balance
        isConnected &&
          (arbLoading ? (
            <button className="p-2 border">Loading...</button>
          ) : (
            <p>Arbitrum Balance: {arbBalace?.formatted}</p>
          ))
      }
    </div>
  );
};

export default ConnectWagmi;
