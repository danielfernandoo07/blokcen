const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EduBlockCert", function () {
  let EduBlockCertFactory, contract, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    EduBlockCertFactory = await ethers.getContractFactory("EduBlockCert");
    contract = await EduBlockCertFactory.deploy();
    await contract.waitForDeployment();
  });

  async function mintAndGetTokenId(to, uri) {
    const tx = await contract.connect(owner).mintCertificate(to.address, uri);
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment.name === "CertificateMinted");
    return event.args.tokenId;
  }

  it("should mint a certificate and emit event", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://minted");
    expect(await contract.ownerOf(tokenId)).to.equal(addr1.address);
  });

  it("should revoke a certificate and mark it invalid", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://cert1");
    const revokeTx = await contract.connect(owner).revokeCertificate(tokenId);
    await expect(revokeTx).to.emit(contract, "CertificateRevoked");
    expect(await contract.isCertificateValid(tokenId)).to.be.false;
  });

  it("should not allow non-owner to revoke", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://failrevoke");
    await expect(
      contract.connect(addr1).revokeCertificate(tokenId)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should transfer certificate", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://transferrable");
    await contract.connect(addr1).transferCertificate(tokenId, addr2.address);
    expect(await contract.ownerOf(tokenId)).to.equal(addr2.address);
  });

  it("should not allow others to transfer someone else's certificate", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://nope");
    await expect(
      contract.connect(addr2).transferCertificate(tokenId, addr2.address)
    ).to.be.revertedWith("Caller is not the owner");
  });

  it("should pause and unpause contract", async function () {
    await contract.connect(owner).pauseContract();
    await expect(
      contract.connect(owner).mintCertificate(addr1.address, "ipfs://paused")
    ).to.be.revertedWith("Contract is paused");

    await contract.connect(owner).unpauseContract();
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://resumed");
    expect(await contract.ownerOf(tokenId)).to.equal(addr1.address);
  });

  it("should update certificate URI and emit event", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://initial");
    const updateTx = await contract.connect(owner).updateCertificateURI(tokenId, "ipfs://updated");
    await expect(updateTx).to.emit(contract, "CertificateURIUpdated");
    const data = await contract.getCertificateData(tokenId);
    expect(data[0]).to.equal("ipfs://updated");
  });

  it("should verify and get certificate data correctly", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://info");
    const [ownerAddr, isValid] = await contract.verifyCertificate(tokenId);
    expect(ownerAddr).to.equal(addr1.address);
    expect(isValid).to.be.true;

    const [uri, revoked] = await contract.getCertificateData(tokenId);
    expect(uri).to.equal("ipfs://info");
    expect(revoked).to.be.false;
  });

  it("should revert actions on non-existent token", async function () {
    await expect(contract.getCertificateData(999)).to.be.revertedWith("Token does not exist");
    await expect(contract.verifyCertificate(999)).to.be.revertedWith("Token does not exist");
    await expect(contract.isCertificateValid(999)).to.be.revertedWith("Token does not exist");
  });

  it("should not allow transfer when contract is paused", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://paused-transfer");
    await contract.connect(owner).pauseContract();
    await expect(
      contract.connect(addr1).transferCertificate(tokenId, addr2.address)
    ).to.be.revertedWith("Contract is paused");
  });

  it("should not allow updating URI of non-existent token", async function () {
    await expect(
      contract.connect(owner).updateCertificateURI(999, "ipfs://fail")
    ).to.be.revertedWith("Token does not exist");
  });

  it("should not allow non-owner to pause or unpause", async function () {
    await expect(contract.connect(addr1).pauseContract()).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(contract.connect(addr1).unpauseContract()).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should still mark token invalid if revoked twice", async function () {
    const tokenId = await mintAndGetTokenId(addr1, "ipfs://double-revoke");
    await contract.connect(owner).revokeCertificate(tokenId);
    await contract.connect(owner).revokeCertificate(tokenId); // tidak error, tetap invalid
    expect(await contract.isCertificateValid(tokenId)).to.be.false;
  });
});