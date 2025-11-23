// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

interface ITapcoinToken is IERC20 {
    function burn(uint256 amount) external;
}


contract TapcoinTools is ERC1155, Ownable {
    
    uint256 public constant HELPER_ID = 1;
    uint256 public constant MINER_ID = 2;
    uint256 public constant ENGINEER_ID = 3;
    uint256 public constant FACTORY_ID = 4;
    uint256 public constant ROCKET_ID = 5;

    string private _baseTokenURI = "https://taptomining.pages.dev/nft/metadata/";
    address public priceVerifier;
    address public immutable TPG_TOKEN_ADDRESS;

    mapping(address => uint256) public nonces;
    
    constructor(address initialOwner, address _tpgTokenAddress)
        ERC1155("")
        Ownable(initialOwner)
    {
        TPG_TOKEN_ADDRESS = _tpgTokenAddress;
        priceVerifier = initialOwner;
    }

    function setPriceVerifier(address _verifier) public onlyOwner {
        priceVerifier = _verifier;
    }

    function uri(uint256 _id) public view override returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, Strings.toString(_id), ".json"));
    }

    function buy(
        address to,
        uint256 id,
        uint256 amount,
        uint256 price,
        uint256 nonce,
        bytes memory signature
    ) public {
        require(nonces[to] == nonce, "Invalid nonce or nonce already used");
        
        bytes32 messageHash = keccak256(abi.encodePacked(to, id, amount, price, nonce));
        
        bytes32 ethSignedMessageHash = ECDSAUpgradeable.toEthSignedMessageHash(messageHash);
        address recoveredSigner = ECDSAUpgradeable.recover(ethSignedMessageHash, signature);
        
        require(recoveredSigner == priceVerifier, "Invalid price verifier signature");

        IERC20(TPG_TOKEN_ADDRESS).transferFrom(to, address(this), price);
        
        ITapcoinToken(TPG_TOKEN_ADDRESS).burn(price);
        
        _mint(to, id, amount, "");

        nonces[to] = nonce + 1;
    }

    function getToolId(string memory _type) public pure returns (uint256) {
        if (keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("helper"))) return HELPER_ID;
        if (keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("miner"))) return MINER_ID;
        if (keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("engineer"))) return ENGINEER_ID;
        if (keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("factory"))) return FACTORY_ID;
        if (keccak256(abi.encodePacked(_type)) == keccak256(abi.encodePacked("rocket"))) return ROCKET_ID;
        revert("Invalid tool type");
    }
}