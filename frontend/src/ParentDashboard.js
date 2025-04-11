import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const BACKEND_URL = "http://localhost:5000";
const STORAGE_KEY = "allowanceHistory";

function ParentDashboard({ wallet }) {
    const [balance, setBalance] = useState("");
    const [ethPrice, setEthPrice] = useState(null);
    const [childName, setChildName] = useState("");
    const [childAddress, setChildAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState("");
    const [history, setHistory] = useState([]);

    const fetchBalance = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balanceWei = await provider.getBalance(wallet);
            const balanceEth = ethers.formatEther(balanceWei);
            setBalance(balanceEth);
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        }
    };

    const fetchEthPrice = async () => {
        try {
            const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
            const data = await res.json();
            setEthPrice(data.ethereum.usd);
        } catch (err) {
            console.error("Failed to fetch ETH price:", err);
        }
    };

    const sendAllowance = async () => {
        if (!childName || !childAddress || !amount) {
            setStatus("❌ All fields are required.");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/set-allowance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ child: childAddress, amount }),
            });

            const data = await res.json();
            if (res.ok) {
                setStatus(`✅ Sent ${amount} ETH to ${childName}`);
                updateHistory(childName, childAddress, amount, data.txHash);
                logTransactionToChild(childAddress, amount, data.txHash);
                setChildName("");
                setChildAddress("");
                setAmount("");
                fetchBalance();
            } else {
                setStatus("❌ Failed: " + data.error);
            }
        } catch (err) {
            console.error(err);
            setStatus("❌ Error sending allowance");
        }
    };

    const logTransactionToChild = (child, amountEth, txHash) => {
        const childKey = `childTransactions_${child}`;
        const oldTxs = JSON.parse(localStorage.getItem(childKey) || "[]");

        const newTx = {
            from: wallet,
            amountEth: parseFloat(amountEth),
            amountUsd: ethPrice ? parseFloat(amountEth) * ethPrice : null,
            timestamp: Date.now(),
            txHash,
        };

        const updatedTxs = [...oldTxs, newTx];
        localStorage.setItem(childKey, JSON.stringify(updatedTxs));
    };

    const updateHistory = (name, address, amount, txHash) => {
        const updated = [...history];
        const existing = updated.find((entry) => entry.child === address);

        if (existing) {
            existing.total += parseFloat(amount);
            existing.txHash = txHash;
        } else {
            updated.push({
                name,
                child: address,
                total: parseFloat(amount),
                txHash,
            });
        }

        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const loadHistory = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Invalid JSON in localStorage.");
            }
        }
    };

    useEffect(() => {
        if (wallet) {
            fetchBalance();
            loadHistory();
            fetchEthPrice();
        }
    }, [wallet]);

    const formattedUsd = (ethAmount) =>
        ethPrice ? (ethAmount * ethPrice).toFixed(2) : "...";

    const shorten = (str) => `${str.slice(0, 6)}...${str.slice(-4)}`;

    return (
        <div className="mt-4">
            <h3>👨‍👧 Welcome to the Parent dashboard</h3>

            <div className="mb-3">
                <strong>Wallet:</strong> {wallet}
                <br />
                <strong>Sepolia Balance:</strong> {balance} ETH / ${formattedUsd(balance)}
            </div>

            <div className="card p-3 mb-3">
                <h5>📤 Send Allowance to Child</h5>
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Child Name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                />
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Child Wallet Address"
                    value={childAddress}
                    onChange={(e) => setChildAddress(e.target.value)}
                />
                <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Amount in ETH"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button className="btn btn-success" onClick={sendAllowance}>
                    Send
                </button>
                {status && <div className="alert alert-info mt-2">{status}</div>}
            </div>

            {history.length > 0 && (
                <div className="card p-3">
                    <h5>📋 Sent Allowance History</h5>
                    <table className="table table-bordered mt-2 text-white">
                        <thead>
                            <tr>
                                <th>Child Name</th>
                                <th>Child Address</th>
                                <th>Total Sent</th>
                                <th>TX Link</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((entry, index) => (
                                <tr key={entry.child}>
                                    <td>
                                        {entry.editing ? (
                                            <input
                                                type="text"
                                                value={entry.name}
                                                onChange={(e) => {
                                                    const updated = [...history];
                                                    updated[index].name = e.target.value;
                                                    setHistory(updated);
                                                }}
                                                className="form-control"
                                            />
                                        ) : (
                                            entry.name
                                        )}
                                    </td>
                                    <td title={entry.child}>
                                        <a
                                            href={`https://sepolia.etherscan.io/address/${entry.child}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-info"
                                        >
                                            {shorten(entry.child)}
                                        </a>
                                    </td>
                                    <td>
                                        {entry.total.toFixed(4)} ETH / ${formattedUsd(entry.total)}
                                    </td>
                                    <td>
                                        {entry.txHash ? (
                                            <a
                                                href={`https://sepolia.etherscan.io/tx/${entry.txHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-warning"
                                            >
                                                {shorten(entry.txHash)}
                                            </a>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {entry.editing ? (
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => {
                                                    const updated = [...history];
                                                    updated[index].editing = false;
                                                    setHistory(updated);
                                                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                                                }}
                                            >
                                                💾 Save
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-outline-light"
                                                onClick={() => {
                                                    const updated = [...history];
                                                    updated[index].editing = true;
                                                    setHistory(updated);
                                                }}
                                            >
                                                ✏️ Edit
                                            </button>
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

export default ParentDashboard;
