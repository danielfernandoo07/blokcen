import { ethers } from "ethers";
import EduBlockABI from "./EduBlockABI.json";

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

function getProvider() {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return signer;
}

export async function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, EduBlockABI, signerOrProvider);
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
};

export const mintCertificate = async (recipientAddress, tokenURI) => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.mintCertificate(recipientAddress, tokenURI);
  await tx.wait();
  console.log("Minted:", tx.hash);
};

export const revokeCertificate = async (tokenId) => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.revokeCertificate(tokenId);
  await tx.wait();
  console.log("Revoked:", tx.hash);
};

export const transferCertificate = async (tokenId, newOwner) => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.transferCertificate(tokenId, newOwner);
  await tx.wait();
  console.log("Transferred:", tx.hash);
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
  await tx.wait();
  console.log("Contract paused:", tx.hash);
};

export const unpauseContract = async () => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.unpauseContract();
  await tx.wait();
  console.log("Contract unpaused:", tx.hash);
};

export const updateCertificateURI = async (tokenId, newURI) => {
  const signer = await getSigner();
  const contract = await getContract(signer);
  const tx = await contract.updateCertificateURI(tokenId, newURI);
  await tx.wait();
  console.log("Metadata updated:", tx.hash);
};
