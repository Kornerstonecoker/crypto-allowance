// frontend/src/RoleRegistration.js
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import userRegistryABI from "./userRegistryABI.json";

const USER_REGISTRY_ADDRESS = "0xB87c9822065C798Fda1A34A521DF3391B26df4Dd";

function RoleRegistration({ wallet }) {
    const [currentRole, setCurrentRole] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const checkRole = async () => {
        if (!wallet) return;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                USER_REGISTRY_ADDRESS,
                userRegistryABI,
                provider
            );

            const isParent = await contract.isParent(wallet);
            const isChild = await contract.isChild(wallet);

            if (isParent) setCurrentRole("parent");
            else if (isChild) setCurrentRole("child");
            else setCurrentRole(null);
        } catch (err) {
            console.error("Role check error:", err);
        }
    };

    const registerRole = async () => {
        if (!wallet || !selectedRole) {
            setStatus("Please select a role.");
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
                selectedRole === "parent"
                    ? await contract.registerParent()
                    : await contract.registerChild();

            setStatus("Transaction sent: " + tx.hash);
            await tx.wait();
            setCurrentRole(selectedRole);
            setStatus(`✅ Successfully registered as ${selectedRole}`);
        } catch (err) {
            console.error("Register role error:", err);
            setStatus("❌ " + err.reason || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkRole();
    }, [wallet]);

    return (
        <div className="mb-4">
            <h4 className="mt-4 mb-3">Register Role</h4>

            {wallet ? (
                <>
                    <p className="text-muted">🔗 Connected: {wallet}</p>

                    {currentRole ? (
                        <div className="alert alert-success text-center">
                            ✅ You are logged in as <strong>{currentRole}</strong>
                        </div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                                <select
                                    className="form-select w-auto"
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    value={selectedRole}
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
                        </>
                    )}
                </>
            ) : (
                <p className="text-muted">🔌 Connect your wallet to register.</p>
            )}
        </div>
    );
}

export default RoleRegistration;
