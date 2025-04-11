// backend/utils/event-listner.js

const { Web3 } = require("web3");
const dotenv = require("dotenv");
const path = require("path");
const contractABI = require(path.join(__dirname, "../contractABI.json"));
const { addTransaction } = require("./transactionCache");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WSS_INFURA_URL));
const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);

function startEventListener(io) {
    console.log("📡 Listening for AllowanceSet events...");
    console.log("🔗 Subscribed to AllowanceSet using WSS:", process.env.WSS_INFURA_URL);

    try {
        contract.events.AllowanceSet({})
            .on("data", (event) => {
                const { parent, child, amount } = event.returnValues;

                const txData = {
                    from: parent,
                    to: child,
                    amountEth: web3.utils.fromWei(amount, "ether"),
                    timestamp: Date.now(),
                    txHash: event.transactionHash,
                };

                console.log("📬 Event received:", txData);

                // ✅ Store using lowercase child address for consistent lookup
                addTransaction(child.toLowerCase(), txData);

                // ✅ Emit the correct event name expected by frontend
                io.emit("new-allowance", txData);
            })
            .on("error", (err) => {
                console.error("❌ WebSocket error:", err.message);
            });
    } catch (err) {
        console.error("❌ Failed to start event listener:", err.message);
    }
}

module.exports = startEventListener;
