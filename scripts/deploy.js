const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);

    // Deploy CryptoAllowance
    const CryptoAllowanceFactory = await hre.ethers.getContractFactory("CryptoAllowance");
    const cryptoAllowance = await CryptoAllowanceFactory.deploy();
    await cryptoAllowance.waitForDeployment();
    const allowanceAddress = await cryptoAllowance.getAddress();
    console.log("CryptoAllowance deployed to:", allowanceAddress);

    // Deploy UserRegistry
    const UserRegistryFactory = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = await UserRegistryFactory.deploy();
    await userRegistry.waitForDeployment();
    const registryAddress = await userRegistry.getAddress();
    console.log("UserRegistry deployed to:", registryAddress);
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});
