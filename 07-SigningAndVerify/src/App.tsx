import { useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import { verifyMessageOffchain, verifyOnChain } from "./utils/verifier";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// On chain verifier contract address
const VerifyContractAddress =
  "0x464ef754fa423817721a5a331074640730058683" as `0x${string}`;

const App = () => {
  const [account, setAccount] = useState<string>("");
  const [signature, setSignature] = useState("");
  const [message, setMessage] = useState("Om is learning blockchain 🚀");
  const [recoveredAddress, setRecoveredAddress] = useState<string | null>(null);

  const [onChainVerificationResult, setOnChainVerificationResult] = useState<
    boolean | null
  >(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const account = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(account[0]);
    }
  };

  const handleSignMessage = async () => {
    if (!account) {
      alert("Connect wallet first!");
      return;
    }
    if (!window.ethereum) {
      alert("Please install MetaMask to sign messages.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const signature = await signer.signMessage(message);
      setSignature(signature);

      //verifying the signature
      const recoveredAddress = verifyMessageOffchain(message, signature);
      setRecoveredAddress(recoveredAddress);
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  const handleOnChainVerify = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signerObj = await provider.getSigner();

    const contractAddress = VerifyContractAddress;

    const abi = [
      "function verify(address expectedSigner, string message, bytes signature) view returns (bool)",
    ];

    const isValid = await verifyOnChain({
      contractAddress,
      abi,
      signer: signerObj,
      message,
      signature,
      expectedSigner: account,
    });
    setOnChainVerificationResult(isValid);
    alert(
      `On-chain verification result: ${isValid ? "✅ Valid" : "❌ Invalid"}`
    );
  };

  return (
    <div style={{ padding: 30, color: "black" }}>
      <h1>Message Signing Demo</h1>

      <button onClick={connectWallet}>Connect Wallet</button>
      <p>Connected Account: {account}</p>

      <hr />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        cols={40}
      />

      <br />

      <button onClick={handleSignMessage}>Sign Message</button>

      {signature && (
        <>
          <p>
            <b>Signature:</b> {signature}
          </p>
          <p>
            <b>Recovered Wallet:</b> {recoveredAddress}
          </p>
          <p>
            Match?{" "}
            {recoveredAddress &&
            recoveredAddress.toLowerCase() === account.toLowerCase()
              ? "✅ YES"
              : "❌ NO"}
          </p>
        </>
      )}

      <button onClick={handleOnChainVerify}>Verify On Chain</button>

      {onChainVerificationResult !== null && (
        <p>
          <b>On-Chain Verification Result:</b>{" "}
          {onChainVerificationResult ? "✅ Valid" : "❌ Invalid"}
        </p>
      )}
    </div>
  );
};

export default App;
