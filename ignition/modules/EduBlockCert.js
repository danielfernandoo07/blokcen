const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const EduBlockCertModule = buildModule("EduBlockCertModule", (m) => {
  const contract = m.contract("EduBlockCert");
  return { contract };
});

module.exports = EduBlockCertModule;
