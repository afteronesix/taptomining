const { ethers, network } = require("hardhat");
const hre = require("hardhat");

const TPG_TOKEN_ADDRESS = "0xTPG_TOKEN_PROXY_ADDRESS"; 

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TapcoinTools (ERC-1155) with account:", deployer.address);

  const priceVerifierAddress = deployer.address;
  const tpgTokenAddress = TPG_TOKEN_ADDRESS; 

  if (tpgTokenAddress === "0xTPG_TOKEN_PROXY_ADDRESS") {
    throw new Error("ERROR: Please update TPG_TOKEN_ADDRESS in deploy-nft.cjs with the actual deployed address.");
  }

  const TapcoinTools = await ethers.getContractFactory("TapcoinTools");
  const tapcoinTools = await TapcoinTools.deploy(
    deployer.address, 
    tpgTokenAddress   
  );

  await tapcoinTools.waitForDeployment();
  const nftAddress = await tapcoinTools.getAddress();

  console.log("TapcoinTools (NFT) deployed to:", nftAddress);
  console.log("Price Verifier Address set to:", priceVerifierAddress);

  if (network.config.chainId === 42161 || network.config.chainId === 421614) {
    console.log("Waiting 30 seconds for block propagation before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
        await hre.run("verify:verify", {
            address: nftAddress,
            constructorArguments: [
                deployer.address,
                tpgTokenAddress,
            ],
        });
        console.log("Verification complete for TapcoinTools.");
    } catch (e) {
        console.error("Verification failed:", e.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});