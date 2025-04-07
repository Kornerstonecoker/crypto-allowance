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

const web3 = new Web3(process.env.INFURA_URL);
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

// ⚠️ Note: The following POST routes require a signer wallet to be connected (private key)

// Route: Deposit ETH (disabled for now, requires signer setup)
app.post("/deposit", async (req, res) => {
    res.status(501).json({ error: "Deposit function requires private key and signer. Not implemented in backend yet." });
});

// Route: Withdraw ETH (disabled for now, requires signer setup)
app.post("/withdraw", async (req, res) => {
    res.status(501).json({ error: "Withdraw function requires private key and signer. Not implemented in backend yet." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
