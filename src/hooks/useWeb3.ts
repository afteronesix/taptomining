import { useMemo } from "react";

// GANTI DENGAN ALAMAT KONTRAK ANDA SETELAH DEPLOY DI ARBITRUM MAINNET
const TPG_TOKEN_ADDRESS = "0x0C633B17e276A4C66FbdC65D6e92Cb9a7870Cd28";
const NFT_TOOLS_ADDRESS = "0xNFT_TOOLS_ADDRESS";
const PRICE_VERIFIER_ADDRESS = "0xPRICE_VERIFIER_ADDRESS"; // Alamat backend/signer Anda

// ABI Sederhana untuk fungsi yang kita perlukan
// Dalam proyek nyata, ini harus diimpor dari file ABI yang dihasilkan Hardhat
const TPG_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function burn(uint256 amount) public",
  "function mintWithSignature(address to, uint256 amount, uint256 nonce, bytes signature) public",
  "function decimals() view returns (uint8)",
];

const NFT_ABI = [
  "function uri(uint256 id) view returns (string)",
  "function setApprovalForAll(address operator, bool approved) public",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function buy(address to, uint256 id, uint256 amount, uint256 price, uint256 nonce, bytes signature) public",
  "function getToolId(string memory _type) public pure returns (uint256)",
];

export function useContractAddresses() {
  return useMemo(
    () => ({
      TPG_TOKEN_ADDRESS,
      NFT_TOOLS_ADDRESS,
      PRICE_VERIFIER_ADDRESS,
      TPG_ABI,
      NFT_ABI,
    }),
    []
  );
}
