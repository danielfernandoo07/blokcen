const express = require("express");
const cors = require("cors");
const { appendCertificateLog } = require("./sheets");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/log-certificate", async (req, res) => {
  try {
    console.log("📥 Incoming request body:", req.body); // debug log
    const { action, tokenId, wallet, tokenURI, isRevoked, metadataJSON } = req.body;

    if (!action || !tokenId || !wallet || !tokenURI || !metadataJSON) {
      return res.status(400).json({ message: "Incomplete log data" });
    }

    await appendCertificateLog({
      action,
      tokenId,
      wallet,
      tokenURI,
      isRevoked: isRevoked || false,
      metadataJSON,
    });

    res.status(200).json({ message: "Log saved to Google Sheets" });
  } catch (error) {
    console.error("Error logging to Sheets:", error.message);
    res.status(500).json({ message: "Failed to log", error: error.message });
  }
});

app.listen(3001, () => console.log("Backend server running on port 3001"));
