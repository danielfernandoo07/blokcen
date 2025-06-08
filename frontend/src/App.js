import React, { useState } from "react";
import {
  connectWallet,
  mintCertificate,
  verifyCertificate,
  getCertificateData,
} from "./edublock";

function App() {
  const [account, setAccount] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [tokenURI, setTokenURI] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [certificateData, setCertificateData] = useState(null);

  // Connect wallet and save account
  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (error) {
      alert("Failed to connect wallet");
      console.error(error);
    }
  };

  // Mint certificate (uses signer)
  const handleMint = async () => {
    if (!account) {
      alert("Connect wallet first!");
      return;
    }
    try {
      await mintCertificate(recipient, tokenURI, account);
      alert("Certificate minted!");
    } catch (error) {
      alert("Minting failed");
      console.error(error);
    }
  };

  // Verify certificate (read-only)
  const handleVerify = async () => {
    try {
      const result = await verifyCertificate(tokenId);
      setVerificationResult(result);
    } catch (error) {
      alert("Verification failed");
      console.error(error);
    }
  };

  // Get certificate data
  const handleGetData = async () => {
    try {
      const data = await getCertificateData(tokenId);
      setCertificateData(data);
    } catch (error) {
      alert("Get data failed");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>EduBlockCert DApp</h1>

      {!account ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <div>Connected as: {account}</div>
      )}

      <hr />

      <h2>Mint Certificate</h2>
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: "300px" }}
      />
      <input
        type="text"
        placeholder="Token URI"
        value={tokenURI}
        onChange={(e) => setTokenURI(e.target.value)}
        style={{ width: "300px", marginLeft: 10 }}
      />
      <button onClick={handleMint}>Mint</button>

      <hr />

      <h2>Verify Certificate</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        style={{ width: "200px" }}
      />
      <button onClick={handleVerify} style={{ marginLeft: 10 }}>
        Verify
      </button>

      {verificationResult && (
        <div style={{ marginTop: 10 }}>
          <strong>Owner:</strong> {verificationResult.owner} <br />
          <strong>Valid:</strong> {verificationResult.isValid ? "Yes" : "No"}
        </div>
      )}

      <button onClick={handleGetData} style={{ marginTop: 10 }}>
        Get Certificate Data
      </button>

      {certificateData && (
        <div style={{ marginTop: 10 }}>
          <strong>Token URI:</strong> {certificateData.uri} <br />
          <strong>Revoked:</strong> {certificateData.isRevoked ? "Yes" : "No"}
        </div>
      )}
    </div>
  );
}

export default App;
