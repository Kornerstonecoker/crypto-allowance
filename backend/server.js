const express = require("express");
const { Web3 } = require("web3");
const dotenv = require("dotenv");
const cors = require("cors");
const contractABI = require("./contractABI.json");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Optional homepage route
app.get("/", (req, res) => {
    res.send("Crypto Allowance API is running 🚀");
});

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

// ✅ Route: Get Allowance
app.get("/allowance/:child", async (req, res) => {
    try {
        const childAddress = req.params.child;
        console.log("Fetching allowance for:", childAddress);

        const result = await contract.methods.getAllowance(childAddress).call();
        const ethValue = web3.utils.fromWei(result, "ether");

        res.json({ allowance: ethValue });
    } catch (err) {
        console.error("getAllowance error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Route: Deposit ETH
app.post("/deposit", async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
    }

    try {
        const tx = await contract.methods.depositETH().send({
            from: account.address,
            value: web3.utils.toWei(amount.toString(), "ether"),
            gas: 200000
        });

        res.json({ message: "Deposit successful", txHash: tx.transactionHash });
    } catch (err) {
        console.error("Deposit error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Route: Withdraw ETH
app.post("/withdraw", async (req, res) => {
    try {
        const tx = await contract.methods.withdrawETH().send({
            from: account.address,
            gas: 200000
        });

        res.json({ message: "Withdraw successful", txHash: tx.transactionHash });
    } catch (err) {
        console.error("Withdraw error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Route: Set Allowance for a child
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

const PORT = process.env.PORT || 5000;
console.log("INFURA_URL:", process.env.INFURA_URL);
console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
