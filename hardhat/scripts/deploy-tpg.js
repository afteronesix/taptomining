const { ethers, upgrades, network } = require("hardhat");
const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying TapcoinToken (Upgradeable) with account:", deployer.address);

    const verifierAddress = deployer.address;

    const TapcoinToken = await ethers.getContractFactory("TapcoinToken");
    const proxy = await upgrades.deployProxy(
        TapcoinToken,
        [deployer.address, verifierAddress],
        { kind: "transparent", initializer: "initialize" }
    );

    await proxy.waitForDeployment();
    const tpgAddress = await proxy.getAddress();

    console.log("TapcoinToken (Proxy) deployed to:", tpgAddress);
    console.log("Verifier Address set to:", verifierAddress);

    if (network.config.chainId === 42161 || network.config.chainId === 421614) {
        console.log("Waiting 30 seconds for block propagation before verification...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        try {
            console.log("Verifying implementation contract...");
            const implementationAddress = await upgrades.erc1967.getImplementationAddress(tpgAddress);

            await hre.run("verify:verify", {
                address: implementationAddress,
                constructorArguments: [],
            });
            console.log("Verification complete for TapcoinToken implementation.");
        } catch (e) {
            console.error("Verification failed:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});