const hre = require("hardhat");

async function main() {
  const EduBlockCert = await hre.ethers.getContractFactory("EduBlockCert");
  const contract = await EduBlockCert.deploy();

  // Wait for deployment to be mined (optional but recommended)
  await contract.waitForDeployment();

  console.log(`EduBlockCert deployed to: ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
