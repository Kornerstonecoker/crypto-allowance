const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with:", deployer.address);

    const ContractFactory = await hre.ethers.getContractFactory("CryptoAllowance");
    const contract = await ContractFactory.deploy();

    await contract.waitForDeployment(); // ✅ Ethers v6 equivalent of deployed()

    const contractAddress = await contract.getAddress(); // ✅ Use getAddress() in Ethers v6
    console.log("Contract deployed to:", contractAddress);
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});
