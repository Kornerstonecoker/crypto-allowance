// backend/utils/routes.js
const express = require("express");
const router = express.Router();

// ✅ Correct import here
const { getTransactions } = require("./transactionCache");

// GET /transactions/:child
router.get("/transactions/:child", (req, res) => {
    try {
        const child = req.params.child.toLowerCase();
        const transactions = getTransactions(child); // ✅ Now this will work

        const formatted = transactions.map(tx => ({
            from: tx.from,
            amountEth: tx.amountEth,
            timestamp: tx.timestamp,
            txHash: tx.txHash,
        }));

        res.json({ transactions: formatted });
    } catch (err) {
        console.error("❌ Failed to fetch transactions:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
