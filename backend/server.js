const express = require("express");
const { Web3 } = require("web3");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const contractABI = require("./contractABI.json");
const userRegistryABI = require("./userRegistryABI.json");

const startEventListener = require("./utils/event-listner");
const transactionRoutes = require("./utils/routes");



dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Crypto Allowance API is running 🚀");
});

app.use("/", transactionRoutes); // 👈 Route: /transactions/:child

// Blockchain Setup
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);
const userRegistry = new web3.eth.Contract(userRegistryABI, process.env.USER_REGISTRY_ADDRESS);

// Allowance API
app.get("/allowance/:child", async (req, res) => {
    try {
        const result = await contract.methods.getAllowance(req.params.child).call();
        res.json({ allowance: web3.utils.fromWei(result, "ether") });
    } catch (err) {
        console.error("getAllowance error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Deposit API
app.post("/deposit", async (req, res) => {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    try {
        const tx = await contract.methods.depositETH().send({
            from: account.address,
            value: web3.utils.toWei(amount.toString(), "ether"),
            gas: 200000,
        });
        res.json({ message: "Deposit successful", txHash: tx.transactionHash });
    } catch (err) {
        console.error("Deposit error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Withdraw API
app.post("/withdraw", async (req, res) => {
    try {
        const tx = await contract.methods.withdrawETH().send({
            from: account.address,
            gas: 200000,
        });
        res.json({ message: "Withdraw successful", txHash: tx.transactionHash });
    } catch (err) {
        console.error("Withdraw error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Set Allowance API
app.post("/set-allowance", async (req, res) => {
    const { child, amount } = req.body;
    if (!child || !amount) {
        return res.status(400).json({ error: "Child address and amount are required" });
    }

    try {
        const tx = await contract.methods.setAllowance(child, web3.utils.toWei(amount, "ether")).send({
            from: account.address,
            gas: 200000,
        });
        res.json({ message: "Allowance set", txHash: tx.transactionHash });
    } catch (err) {
        console.error("SetAllowance error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Role Registration
app.post("/register-parent", async (req, res) => {
    try {
        const tx = await userRegistry.methods.registerParent().send({
            from: account.address,
            gas: 200000,
        });
        res.json({ message: "Parent registered", txHash: tx.transactionHash });
    } catch (err) {
        console.error("Register Parent error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post("/register-child", async (req, res) => {
    try {
        const tx = await userRegistry.methods.registerChild().send({
            from: account.address,
            gas: 200000,
        });
        res.json({ message: "Child registered", txHash: tx.transactionHash });
    } catch (err) {
        console.error("Register Child error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Check Roles
app.get("/is-parent/:address", async (req, res) => {
    try {
        const isParent = await userRegistry.methods.isParent(req.params.address).call();
        res.json({ isParent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/is-child/:address", async (req, res) => {
    try {
        const isChild = await userRegistry.methods.isChild(req.params.address).call();
        res.json({ isChild });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Event Listener + WebSocket
startEventListener(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
