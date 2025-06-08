import React, { useState } from "react";
import { mintCertificate } from "../edublock";

const MintCertificateForm = () => {
  const [recipient, setRecipient] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    try {
      setLoading(true);

      // 1. Buat metadata
      const metadata = {
        name: name,
        description: `Sertifikat untuk ${name} yang telah menyelesaikan ${course}`,
        attributes: [
          { trait_type: "Nama", value: name },
          { trait_type: "Kursus", value: course },
          { trait_type: "Tanggal", value: date }
        ]
      };

      // 2. Upload ke IPFS via Pinata
      const metadataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      });

      const metadataData = await metadataRes.json();
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`;

      // 3. Mint NFT
      await mintCertificate(recipient, tokenURI);
      alert("✅ NFT Sertifikat berhasil dimint!");

      // Reset form
      setRecipient("");
      setName("");
      setCourse("");
      setDate("");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mint sertifikat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">🎓 Mint NFT Sertifikat</h2>

      <input className="w-full border p-2 mb-3" type="text" placeholder="Receiver Wallet Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />

      <input className="w-full border p-2 mb-3" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

      <input className="w-full border p-2 mb-3" type="text" placeholder="Course Name" value={course} onChange={(e) => setCourse(e.target.value)} />

      <input className="w-full border p-2 mb-3" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <button
        disabled={loading}
        onClick={handleMint}
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Memproses..." : "Mint Sertifikat NFT"}
      </button>
    </div>
  );
};

export default MintCertificateForm;
