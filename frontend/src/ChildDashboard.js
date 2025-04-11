import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:5000"; // Change on deploy

function ChildDashboard({ wallet }) {
    const [transactions, setTransactions] = useState([]);
    const [labels, setLabels] = useState({});
    const [editingLabel, setEditingLabel] = useState(null);
    const [newLabel, setNewLabel] = useState("");
    const [balance, setBalance] = useState(null);

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
            <p>
                <strong>Balance:</strong>{" "}
                {balance ? `${balance} ETH` : "Loading..."}
            </p>

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
