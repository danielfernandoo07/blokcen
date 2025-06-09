import React, { useState } from "react";
import {
  connectWallet,
  mintCertificate,
  verifyCertificate,
  getCertificateData,
  transferCertificate,
  revokeCertificate,
  pauseContract,
  unpauseContract,
  updateCertificateURI,
} from "./edublock";
import { PinataSDK } from "pinata";

function App() {
  const [account, setAccount] = useState(null);

  // Minting data
  const [name, setName] = useState("rey");
  const [course, setCourse] = useState("halo");
  const [image, setImage] = useState(null);
  const [date, setDate] = useState("");
  const [recipient, setRecipient] = useState(
    "0x90b6f4A11C0BA28750dcCA3416985aD2173aC429"
  );
  const [tokenURI, setTokenURI] = useState("");

  // Verification
  const [tokenId, setTokenId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [certificateData, setCertificateData] = useState(null);

  // Transfer
  const [tokenIdToTf, setTokenIdToTf] = useState("");
  const [addressRecipient, setAddressRecipient] = useState("");

  // Revoke
  const [tokenIdToRevoke, setTokenIdToRevoke] = useState("");

  // Update Metadata URI
  const [tokenIdToUpdate, setTokenIdToUpdate] = useState("");
  const [tokenUriToUpdate, setTokenUriToUpdate] = useState("");
  const [nameToUpdate, setNameToUpdate] = useState("nath");
  const [courseToUpdate, setCourseToUpdate] = useState("haloo");
  const [imageToUpdate, setImageToUpdate] = useState(null);
  const [dateToUpdate, setDateToUpdate] = useState("");

  const usePinata = new PinataSDK({
    pinataJwt: `${process.env.REACT_APP_JWT}`,
    pinataGateway: `${process.env.REACT_APP_GATEWAY}`,
  });

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

  const handlePauseContract = async () => {
    if (!account) {
      alert("Connect wallet first!");
      return;
    }

    try {
      const hash = await pauseContract(parseInt(tokenIdToRevoke));
      alert(
        `✅ Contract berhasil dipause! Cek di https://holesky.etherscan.io/tx/${hash}`
      );
    } catch (error) {
      console.log(error);
      alert("❌ Pause gagal");
    }
  };

  const handleUnpauseContract = async () => {
    if (!account) {
      alert("Connect wallet first!");
      return;
    }

    try {
      const hash = await unpauseContract(parseInt(tokenIdToRevoke));
      alert(
        `✅ Contract berhasil di-unpause! Cek di https://holesky.etherscan.io/tx/${hash}`
      );
    } catch (error) {
      console.log(error);
      alert("❌ Unpause gagal");
    }
  };

  const handleUpdateMetadataURI = async () => {
    if (!account) {
      alert("Connect wallet first!");
      return;
    }

    if (
      !tokenIdToUpdate ||
      !nameToUpdate ||
      !dateToUpdate ||
      !courseToUpdate ||
      !imageToUpdate
    ) {
      alert("Isi semua kolom terlebih dahulu!");
      return;
    }

    const imageHash = (await usePinata.upload.public.file(imageToUpdate)).cid;
    const url = "https://gateway.pinata.cloud/ipfs";

    try {
      const metadata = {
        name: `Sertifikat: ${nameToUpdate}`,
        image: `${url}/${imageHash}`,
        description: `${nameToUpdate} telah menyelesaikan kursus ${course} pada ${date}`,
        attributes: [
          { trait_type: "Nama", value: nameToUpdate },
          { trait_type: "Kursus", value: courseToUpdate },
          { trait_type: "Tanggal", value: dateToUpdate },
        ],
      };

      const fileHash = (await usePinata.upload.public.json(metadata)).cid;
      const uri = `${url}/${fileHash}`;

      const hash = await updateCertificateURI(parseInt(tokenIdToUpdate), uri);
      alert(
        `✅ Sertifikat berhasil diupdate metadatanya! Cek di https://holesky.etherscan.io/tx/${hash}`
      );

      setTokenIdToUpdate("");
      setNameToUpdate("");
      setDateToUpdate("");
      setImageToUpdate("");
      setCourseToUpdate("");
    } catch (error) {
      alert("❌ Gagal update metadata sertifikat");
      console.error(error);
    }
  };

  const handleRevoke = async () => {
    if (!account) {
      alert("Connect wallet first!");
      return;
    }

    if (!tokenIdToRevoke) {
      alert("Isi semua kolom terlebih dahulu!");
      return;
    }

    try {
      const hash = await revokeCertificate(parseInt(tokenIdToRevoke));
      alert(
        `✅ Sertifikat berhasil direvoke! Cek di https://holesky.etherscan.io/tx/${hash}`
      );

      setTokenIdToRevoke("");
    } catch (error) {
      console.log(error);
      alert("❌ Revoke gagal");
    }
  };

  const handleTransfer = async () => {
    if (!account) {
      alert("Connect wallet first!");
      return;
    }

    if (!tokenIdToTf || !addressRecipient) {
      alert("Isi semua kolom terlebih dahulu!");
      return;
    }

    try {
      const hash = await transferCertificate(
        parseInt(tokenIdToTf),
        addressRecipient
      );
      alert(
        `✅ Sertifikat berhasil ditransfer! Cek di https://holesky.etherscan.io/tx/${hash}`
      );

      setTokenIdToTf("");
      setAddressRecipient("");
    } catch (error) {
      console.log(error);
      alert("❌ Transfer gagal");
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

    const imageHash = (await usePinata.upload.public.file(image)).cid;
    const url = "https://gateway.pinata.cloud/ipfs";

    try {
      const metadata = {
        name: `Sertifikat: ${name}`,
        image: `${url}/${imageHash}`,
        description: `${name} telah menyelesaikan kursus ${course} pada ${date}`,
        attributes: [
          { trait_type: "Nama", value: name },
          { trait_type: "Kursus", value: course },
          { trait_type: "Tanggal", value: date },
        ],
      };

      const fileHash = (await usePinata.upload.public.json(metadata)).cid;
      const uri = `${url}/${fileHash}`;

      const hash = await mintCertificate(recipient, uri);
      alert(
        `✅ Sertifikat berhasil dimint! Cek di https://holesky.etherscan.io/tx/${hash}`
      );

      setName("");
      setImage(null);
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
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        style={{ width: "300px", marginBottom: 10 }}
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

      <hr />

      <h2>Transfer Sertifikat</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenIdToTf}
        onChange={(e) => setTokenIdToTf(e.target.value)}
        style={{ width: "200px" }}
      />
      <input
        type="text"
        placeholder="Recipient"
        value={addressRecipient}
        onChange={(e) => setAddressRecipient(e.target.value)}
        style={{ width: "200px" }}
      />
      <button onClick={handleTransfer} style={{ marginLeft: 10 }}>
        Transfer
      </button>

      <hr />

      <h2>Revoke Sertifikat</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenIdToRevoke}
        onChange={(e) => setTokenIdToRevoke(e.target.value)}
        style={{ width: "200px" }}
      />
      <button onClick={handleRevoke} style={{ marginLeft: 10 }}>
        Revoke
      </button>

      <hr />

      <h2>Pause/Unpause Kontrak</h2>
      <button onClick={handlePauseContract} style={{ marginLeft: 10 }}>
        Pause
      </button>
      <button onClick={handleUnpauseContract} style={{ marginLeft: 10 }}>
        Unpause
      </button>

      <hr />

      <h2>Update Metadata NFT</h2>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenIdToUpdate}
        onChange={(e) => setTokenIdToUpdate(e.target.value)}
        style={{ width: "300px", marginBottom: 5 }}
      />
      <br />
      <input
        type="text"
        placeholder="Nama Penerima"
        value={nameToUpdate}
        onChange={(e) => setNameToUpdate(e.target.value)}
        style={{ width: "300px", marginBottom: 5 }}
      />
      <br />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageToUpdate(e.target.files[0])}
        style={{ width: "300px", marginBottom: 10 }}
      />
      <br />

      <input
        type="text"
        placeholder="Nama Kursus"
        value={courseToUpdate}
        onChange={(e) => setCourseToUpdate(e.target.value)}
        style={{ width: "300px", marginBottom: 5 }}
      />
      <br />
      <input
        type="date"
        value={dateToUpdate}
        onChange={(e) => setDateToUpdate(e.target.value)}
        style={{ width: "300px", marginBottom: 5 }}
      />
      <br />
      <button onClick={handleUpdateMetadataURI}>
        Update Metadata Sertifikat
      </button>
    </div>
  );
}

export default App;
