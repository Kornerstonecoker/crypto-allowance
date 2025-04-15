import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ethers } from "ethers";
import contractABI from "./contractABI.json"; // adjust path if needed

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const CONTRACT_ADDRESS = "0x854f2838Ee8Eeecc8FEc913074D8deFA3c69b175"; // from your .env

function ChildDashboard({ wallet }) {
    const [transactions, setTransactions] = useState([]);
    const [labels, setLabels] = useState({});
    const [editingLabel, setEditingLabel] = useState(null);
    const [newLabel, setNewLabel] = useState("");
    const [balance, setBalance] = useState(null);
    const [statusMsg, setStatusMsg] = useState("");

    const STORAGE_KEY = `labels_${wallet}`;

    useEffect(() => {
        if (!wallet) return;

        const fetchTransactions = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/transactions/${wallet}`);
                const data = await res.json();
                if (data.transactions) {
                    setTransactions(data.transactions);
                    const savedLabels = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
                    setLabels(savedLabels);
                }
            } catch (err) {
                console.error("❌ Failed to fetch transactions:", err);
            }
        };

        const fetchBalance = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/balance/${wallet}`);
                const data = await res.json();
                setBalance(data.balance);
            } catch (err) {
                console.error("❌ Failed to fetch balance:", err);
            }
        };

        fetchTransactions();
        fetchBalance();

        const socket = io(BACKEND_URL);
        socket.on("new-allowance", (tx) => {
            if (tx.to.toLowerCase() === wallet.toLowerCase()) {
                setTransactions((prev) => [tx, ...prev]);
            }
        });

        return () => socket.disconnect();
    }, [wallet]);

    const handleWithdraw = async () => {
        if (!window.ethereum || !wallet) return;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

            const allowance = await contract.getAllowance(wallet);
            if (allowance.toString() === "0") {
                setStatusMsg("⚠️ No allowance available to withdraw.");
                return;
            }

            const tx = await contract.withdrawETH();
            await tx.wait();
            setStatusMsg("✅ Withdrawal successful!");
        } catch (err) {
            console.error("❌ Withdrawal failed:", err);
            setStatusMsg("❌ Withdrawal failed. See console for details.");
        }
    };

    const handleLabelEdit = (address) => {
        setEditingLabel(address);
        setNewLabel(labels[address] || "");
    };

    const saveLabel = (address) => {
        const updatedLabels = { ...labels, [address]: newLabel };
        const updatedTx = transactions.map((tx) =>
            tx.from === address ? { ...tx, label: newLabel } : tx
        );
        setLabels(updatedLabels);
        setTransactions(updatedTx);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLabels));
        setEditingLabel(null);
        setNewLabel("");
    };

    const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="mt-4">
            <h3>🧒 Child Dashboard</h3>
            <p>
                <strong>Connected Wallet:</strong>{" "}
                <span className="text-info">{wallet}</span>
            </p>
            <div className="d-flex align-items-center justify-content-between">
                <p>
                    <strong>Balance:</strong>{" "}
                    {balance ? `${balance} ETH` : "Loading..."}
                </p>
                <button className="btn btn-warning btn-sm" onClick={handleWithdraw}>
                    Withdraw
                </button>
            </div>
            {statusMsg && <div className="alert alert-info">{statusMsg}</div>}

            {transactions.length === 0 ? (
                <div className="alert alert-info">No transactions yet.</div>
            ) : (
                <div className="card p-3">
                    <h5>📥 Received Allowance</h5>
                    <table className="table table-dark table-bordered table-hover mt-2">
                        <thead>
                            <tr>
                                <th>From</th>
                                <th>ETH / USD</th>
                                <th>Date</th>
                                <th>Label</th>
                                <th>TX Hash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, i) => (
                                <tr key={i}>
                                    <td title={tx.from}>{shortenAddress(tx.from)}</td>
                                    <td>
                                        {tx.amountEth} ETH / ${tx.amountUsd?.toFixed(2) || "—"}
                                    </td>
                                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                                    <td>
                                        {editingLabel === tx.from ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={newLabel}
                                                    onChange={(e) => setNewLabel(e.target.value)}
                                                />
                                                <button
                                                    className="btn btn-success btn-sm mt-1"
                                                    onClick={() => saveLabel(tx.from)}
                                                >
                                                    Save
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span>{labels[tx.from] || "Unlabeled"}</span>{" "}
                                                <button
                                                    className="btn btn-outline-light btn-sm ms-2"
                                                    onClick={() => handleLabelEdit(tx.from)}
                                                >
                                                    Edit
                                                </button>
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        {tx.txHash ? (
                                            <a
                                                href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-info"
                                            >
                                                {shortenAddress(tx.txHash)}
                                            </a>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ChildDashboard;
