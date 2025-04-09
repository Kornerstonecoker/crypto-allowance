import React, { useEffect, useState } from "react";

function ChildDashboard({ wallet }) {
    const [transactions, setTransactions] = useState([]);
    const [labels, setLabels] = useState({});
    const [editingLabel, setEditingLabel] = useState(null);
    const [newLabel, setNewLabel] = useState("");

    useEffect(() => {
        if (!wallet) return;

        const key = `childTransactions_${wallet}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            setTransactions(parsed);

            const savedLabels = {};
            parsed.forEach((tx) => {
                if (tx.label) {
                    savedLabels[tx.from] = tx.label;
                }
            });
            setLabels(savedLabels);
        }
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

        const key = `childTransactions_${wallet}`;
        localStorage.setItem(key, JSON.stringify(updatedTx));

        setLabels(updatedLabels);
        setTransactions(updatedTx);
        setEditingLabel(null);
        setNewLabel("");
    };

    const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="mt-4">
            <h3>🧒 Child Dashboard</h3>
            <p>
                <strong>Connected Wallet:</strong> {wallet}
            </p>

            {transactions.length === 0 ? (
                <p>No transactions yet.</p>
            ) : (
                <div className="card p-3">
                    <h5>📥 Received Allowance</h5>
                    <table className="table table-bordered table-dark table-hover mt-2">
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
                                    <td>{tx.amountEth} ETH / ${tx.amountUsd?.toFixed(2) || "—"}</td>
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
