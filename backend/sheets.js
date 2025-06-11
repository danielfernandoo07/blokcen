const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const auth = new GoogleAuth({
  keyFile: "./backend/credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SHEET_ID = "1KxmBTC7IgBeqY4MVdrH_ZtR__HpMLjygk2If8sNBFss";
const SHEET_NAME = "certificates";

async function appendCertificateLog({ action, tokenId, wallet, tokenURI, isRevoked, metadataJSON }) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const now = new Date().toISOString();
  const metadata = metadataJSON || {};
  const attrs = Array.isArray(metadata.attributes) ? metadata.attributes : [];

  const nama = attrs.find(attr => attr.trait_type === "Nama")?.value || "";
  const kursus = attrs.find(attr => attr.trait_type === "Kursus")?.value || "";
  const tanggal = attrs.find(attr => attr.trait_type === "Tanggal")?.value || "";

  const row = [
    action || "",               // A
    tokenId || "",              // B
    wallet || "",               // C
    nama,                       // D
    kursus,                     // E
    tanggal,                    // F
    tokenURI || "",             // G
    isRevoked ? "TRUE" : "FALSE", // H
    now                         // I - timestamp
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

module.exports = { appendCertificateLog };

