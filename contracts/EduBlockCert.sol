// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EduBlockCert is ERC721URIStorage, Ownable, Pausable {
    uint256 private _tokenIds;

    // Menyimpan status sertifikat yang dicabut
    mapping(uint256 => bool) private _revoked;

    // Events
    event CertificateMinted(address indexed recipient, uint256 indexed tokenId);
    event CertificateRevoked(uint256 indexed tokenId);
    event CertificateTransferred(uint256 indexed tokenId, address indexed newOwner);
    event CertificateURIUpdated(uint256 indexed tokenId, string newURI);

    constructor() ERC721("EduBlockCert", "EBC") {
    }

    modifier onlyWhenActive() {
        require(!paused(), "Contract is paused");
        _;
    }

    function mintCertificate(address recipient, string memory tokenURI)
        public
        onlyOwner
        onlyWhenActive
        returns (uint256)
    {
        _tokenIds++;
        uint256 newCertId = _tokenIds;
        _mint(recipient, newCertId);
        _setTokenURI(newCertId, tokenURI);
        emit CertificateMinted(recipient, newCertId);
        return newCertId;
    }

    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _revoked[tokenId] = true;
        emit CertificateRevoked(tokenId);
    }

    function isCertificateValid(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return !_revoked[tokenId];
    }

    function transferCertificate(uint256 tokenId, address newOwner) public onlyWhenActive {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner");
        _transfer(msg.sender, newOwner, tokenId);
        emit CertificateTransferred(tokenId, newOwner);
    }

    function pauseContract() public onlyOwner {
        _pause();
    }

    function unpauseContract() public onlyOwner {
        _unpause();
    }

    function verifyCertificate(uint256 tokenId) public view returns (address owner, bool isValid) {
        require(_exists(tokenId), "Token does not exist");
        return (ownerOf(tokenId), !_revoked[tokenId]);
    }

    function getCertificateData(uint256 tokenId) public view returns (string memory uri, bool isRevoked) {
        require(_exists(tokenId), "Token does not exist");
        return (tokenURI(tokenId), _revoked[tokenId]);
    }

    function updateCertificateURI(uint256 tokenId, string memory newURI) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newURI);
        emit CertificateURIUpdated(tokenId, newURI);
    }
}

