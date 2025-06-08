import React, { useState } from "react";
import {
  connectWallet,
  mintCertificate,
  verifyCertificate,
  getCertificateData,
} from "./edublock";

function App() {
  const [account, setAccount] = useState(null);

  // Minting data
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tokenURI, setTokenURI] = useState("");

  // Verification
  const [tokenId, setTokenId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [certificateData, setCertificateData] = useState(null);

  // Connect wallet
  const handleConnect = async () => {
    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (error) {
      alert("Failed to connect wallet");
      console.error(error);
    }
  };

  // Mint with metadata
  const handleMint = async () => {
    if (!account) {
      alert("Connect wallet first!");
      return;
    }

    if (!name || !course || !date || !recipient) {
      alert("Isi semua kolom terlebih dahulu!");
      return;
    }

    try {
      const metadata = {
        name: `Sertifikat: ${name}`,
        description: `${name} telah menyelesaikan kursus ${course} pada ${date}`,
        attributes: [
          { trait_type: "Nama", value: name },
          { trait_type: "Kursus", value: course },
          { trait_type: "Tanggal", value: date },
        ],
      };

      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      });

      const data = await res.json();
      const uri = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      setTokenURI(uri);

      await mintCertificate(recipient, uri);
      alert("✅ Sertifikat berhasil dimint!");

      setName("");
      setCourse("");
      setDate("");
      setRecipient("");
    } catch (error) {
      alert("❌ Gagal mint sertifikat");
      console.error(error);
    }
  };

  const handleVerify = async () => {
    try {
      const result = await verifyCertificate(tokenId);
      setVerificationResult(result);
    } catch (error) {
      alert("Verification failed");
      console.error(error);
    }
  };

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

      <h2>Mint Sertifikat NFT</h2>
      <input
        type="text"
        placeholder="Nama Penerima"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "300px", marginBottom: 5 }}
      />
      <br />
      <input
        type="text"
        placeholder="Nama Kursus"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        style={{ width: "300px", marginBottom: 5 }}
      />
      <br />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ width: "300px", marginBottom: 5 }}
      />
      <br />
      <input
        type="text"
        placeholder="Wallet Address Penerima"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: "300px", marginBottom: 10 }}
      />
      <br />
      <button onClick={handleMint}>Mint Sertifikat</button>

      {tokenURI && (
        <div style={{ marginTop: 10 }}>
          <strong>Token URI:</strong>{" "}
          <a href={tokenURI} target="_blank" rel="noreferrer">
            {tokenURI}
          </a>
        </div>
      )}

      <hr />

      <h2>Verifikasi Sertifikat</h2>
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
          <strong>Token URI:</strong>{" "}
          <a href={certificateData.uri} target="_blank" rel="noreferrer">
            {certificateData.uri}
          </a>
          <br />
          <strong>Revoked:</strong> {certificateData.isRevoked ? "Yes" : "No"}
        </div>
      )}
    </div>
  );
}

export default App;
