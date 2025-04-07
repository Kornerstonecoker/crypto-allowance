require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // <-- This must be before using process.env

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: process.env.INFURA_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
