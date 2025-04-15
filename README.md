
# Crypto Allowance - Decentralized Allowance Management App

Crypto Allowance is a full-stack decentralized web application that allows parents to allocate Ethereum-based allowances to their children. The platform uses smart contracts, real-time communication, and cloud-native deployment to deliver a responsive and transparent user experience.

## Features

- **Role-Based Wallet Access:** Parents and children log in using MetaMask; roles are assigned via a smart contract.
- **Send and Withdraw ETH:** Parents assign ETH allowances, and children withdraw their balance via the blockchain.
- **Live ETH/USD Price:** Real-time conversion using the Coingecko API.
- **Transaction History:** Includes sender, amount in ETH/USD, timestamp, and Etherscan link.
- **Real-Time Updates:** Allowance transactions are pushed via WebSocket to connected clients.
- **Labeling System:** Children can assign friendly labels to parent wallet addresses.

## Technologies Used

### Frontend
- React 19
- Bootstrap 5
- ethers.js
- Socket.IO Client
- MetaMask
- Coingecko API

### Backend
- Node.js & Express
- Web3.js & Socket.IO
- dotenv for environment variables
- Deployed on AWS Elastic Beanstalk

### Smart Contracts
- Solidity (CryptoAllowance.sol & UserRegistry.sol)
- Deployed to Sepolia Testnet via Hardhat and Infura

### Deployment
- **Frontend**: Amazon S3 (Static Website Hosting)
- **Backend**: AWS Elastic Beanstalk (Node.js Environment)

## Local Development

### Prerequisites
- Node.js & npm
- MetaMask wallet (connected to Sepolia testnet)
- Hardhat (for smart contract deployment)

### Running the Frontend
```bash
cd frontend
npm install
npm start
```

### Running the Backend
```bash
cd backend
npm install
node server.js
```

> Ensure your `.env` files are properly set with contract addresses and Infura keys.

## Future Improvements
- Dockerize the full stack
- CI/CD pipeline for automated testing and deployment
- Migrate localStorage to a persistent DB (e.g., MongoDB)
- Add better validation and smart contract access control

## Author
Simon Coker
Developed as part of MSc Cloud Computing Blockchain Concepts Project.

## License
MIT License
