// frontend/src/RoleRegistration.js
import React, { useState } from "react";
import { ethers } from "ethers";
import userRegistryABI from "./userRegistryABI.json";

const USER_REGISTRY_ADDRESS = "0xB87c9822065C798Fda1A34A521DF3391B26df4Dd";

function RoleRegistration() {
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [wallet, setWallet] = useState("");
    const [loading, setLoading] = useState(false);

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                setWallet(accounts[0]);
                setStatus("");
            } else {
                alert("Please install MetaMask.");
            }
        } catch (err) {
            setStatus("Wallet connection failed.");
        }
    };

    const registerRole = async () => {
        if (!wallet || !role) {
            setStatus("Please select a role and connect wallet.");
            return;
        }

        try {
            setLoading(true);
            setStatus("Sending transaction...");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                USER_REGISTRY_ADDRESS,
                userRegistryABI,
                signer
            );

            const tx =
                role === "parent"
                    ? await contract.registerParent()
                    : await contract.registerChild();

            setStatus("Transaction sent: " + tx.hash);
            await tx.wait();
            setStatus(`✅ Successfully registered as ${role}`);
        } catch (err) {
            console.error("Register role error:", err);
            setStatus("❌ " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-4">
            <h4 className="mt-4 mb-3">Register Role</h4>

            {!wallet && (
                <button className="btn btn-outline-primary mb-3" onClick={connectWallet}>
                    Connect Wallet
                </button>
            )}

            {wallet && <p className="text-muted">🔗 Connected: {wallet}</p>}

            <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                <select
                    className="form-select w-auto"
                    onChange={(e) => setRole(e.target.value)}
                    value={role}
                >
                    <option value="">Select Role</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                </select>

                <button
                    className="btn btn-success"
                    onClick={registerRole}
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </div>

            {status && (
                <div className="alert alert-info text-center" role="alert">
                    {status}
                </div>
            )}
        </div>
    );
}

export default RoleRegistration;
