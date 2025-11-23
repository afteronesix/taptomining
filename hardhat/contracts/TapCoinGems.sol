// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract TapcoinToken is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    uint8 private _decimals;

    mapping(address => uint256) public nonces;

    address public verifier;

    function initialize(address initialOwner, address _verifier) public initializer {
        __ERC20_init("TapCoin Gems", "TPG");
        __Ownable_init(initialOwner);
        _decimals = 0;
        verifier = _verifier;
    }

    function mintWithSignature(
        address to,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) public {
        require(nonces[to] == nonce, "Invalid nonce or nonce already used");

        bytes32 messageHash = keccak256(abi.encodePacked(to, amount, nonce));

        bytes32 ethSignedMessageHash = ECDSAUpgradeable.toEthSignedMessageHash(messageHash);
        address recoveredSigner = ECDSAUpgradeable.recover(ethSignedMessageHash, signature);

        require(recoveredSigner == verifier, "Invalid verifier");

        _mint(to, amount);

        nonces[to] = nonce + 1;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}