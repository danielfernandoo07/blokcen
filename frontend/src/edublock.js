import { BrowserProvider, Contract } from "ethers";
import EduBlockABI from "./EduBlockABI.json";

const CONTRACT_ADDRESS = "0xF642fcb3bD37f2f7E6707cf17A139340499Ffd19";
const rpc = "https://ethereum-holesky.publicnode.com";

function getProvider() {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return signer;
}

export async function getContract(signerOrProvider) {
  return new Contract(CONTRACT_ADDRESS, EduBlockABI, signerOrProvider);
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts[0];
};

export const mintCertificate = async (recipientAddress, tokenURI) => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.mintCertificate(recipientAddress, tokenURI);
  console.log(tx);
  await tx.wait();
  console.log("Minted:", tx.hash);
  return tx.hash;
};

export const revokeCertificate = async (tokenId) => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.revokeCertificate(tokenId);
  console.log(tx);
  await tx.wait();
  console.log("Revoked:", tx.hash);
  return tx.hash;
};

export const transferCertificate = async (tokenId, newOwner) => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.transferCertificate(tokenId, newOwner);
  console.log(tx);
  await tx.wait();
  console.log("Transferred:", tx.hash);
  return tx.hash;
};

export const verifyCertificate = async (tokenId) => {
  const provider = getProvider();
  const contract = await getContract(provider);
  const [owner, isValid] = await contract.verifyCertificate(tokenId);
  return { owner, isValid };
};

export const getCertificateData = async (tokenId) => {
  const provider = getProvider();
  const contract = await getContract(provider);
  const [uri, isRevoked] = await contract.getCertificateData(tokenId);
  return { uri, isRevoked };
};

export const pauseContract = async () => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.pauseContract();
  console.log(tx);
  await tx.wait();
  console.log("Contract paused:", tx.hash);
  return tx.hash;
};

export const unpauseContract = async () => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.unpauseContract();
  console.log(tx);
  await tx.wait();
  console.log("Contract unpaused:", tx.hash);
  return tx.hash;
};

export const updateCertificateURI = async (tokenId, newURI) => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.updateCertificateURI(tokenId, newURI);
  console.log(tx);
  await tx.wait();
  console.log("Metadata updated:", tx.hash);
  return tx.hash;
};
