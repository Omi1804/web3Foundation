import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { WALLET_PRIVATE_KEY } from "../../../config"; // Importing a private key from config (avoid exposing this in frontend)
import { erc20Abi } from "viem"; // ERC20 ABI used to interact with token contracts

const Listen = () => {
  // React state to manage the WebSocket provider instance
  const [provider, setProvider] = useState<ethers.WebSocketProvider | null>(
    null
  );

  // React state to hold an array of log strings for UI display
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Establishes a WebSocket connection to Arbitrum Sepolia via Infura on component mount
    const initProvider = async () => {
      const prov = new ethers.WebSocketProvider(
        "wss://arbitrum-sepolia.infura.io/ws/v3/20381ad547034bab9d596630a5f60df5"
      );
      setProvider(prov); // Save provider in state
    };

    initProvider(); // Call the async function
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const handleConnect = async () => {
    if (provider) {
      // Create a new wallet instance with the private key and connect it to the provider
      const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

      // Retrieve wallet address to confirm connection
      const address = await wallet.getAddress();

      // Append a log message indicating successful wallet connection
      setLogs((prev) => [...prev, `✅ Connected wallet address: ${address}`]);
    }
  };

  const startListening = () => {
    if (provider) {
      // Address of the ERC20 token contract you want to listen to
      const tokenAddress = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

      // Create a contract instance with ABI and provider
      const tokenContract = new ethers.Contract(
        tokenAddress,
        erc20Abi,
        provider
      );

      // Subscribe to "Transfer" events emitted by the token contract
      tokenContract.on("Transfer", (from, to, value, event) => {
        // Format the event data and append it to the logs
        const log = `🔁 Transfer from ${from} to ${to} of value ${ethers.formatUnits(
          value,
          6
        )}`;
        setLogs((prev) => [...prev, log]);
      });

      // Log the start of event listening
      setLogs((prev) => [...prev, `📡 Started listening for Transfer events.`]);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      {/* Button to connect the wallet */}
      <button onClick={handleConnect}>Connect</button>

      {/* Button to start listening to token transfer events */}
      <button onClick={startListening} style={{ marginLeft: "10px" }}>
        Start Listening
      </button>

      {/* Display log output */}
      <div style={{ marginTop: "20px" }}>
        <h3>📜 Logs:</h3>
        <div
          style={{
            background: "#f4f4f4",
            border: "1px solid #ccc",
            padding: "10px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {/* Conditional rendering for empty log list */}
          {logs.length === 0 ? (
            <p>No logs yet...</p>
          ) : (
            logs.map((log, index) => <div key={index}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
};

export default Listen;
