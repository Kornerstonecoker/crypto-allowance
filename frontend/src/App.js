// src/App.js
import React, { useEffect, useState } from "react";
import RoleRegistration from "./RoleRegistration";
import ParentDashboard from "./ParentDashboard";
import ChildDashboard from "./ChildDashboard";
import { ethers } from "ethers";
import userRegistryABI from "./userRegistryABI.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const USER_REGISTRY_ADDRESS = "0xB87c9822065C798Fda1A34A521DF3391B26df4Dd";

function App() {
  const [wallet, setWallet] = useState("");
  const [role, setRole] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
    } else {
      alert("MetaMask not found. Please install it.");
    }
  };

  const logout = async () => {
    setWallet("");
    setRole("");

    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (err) {
      console.warn("Permissions cleanup skipped:", err.message);
    }

    window.location.reload();
  };

  const checkUserRole = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        USER_REGISTRY_ADDRESS,
        userRegistryABI,
        provider
      );

      const isParent = await contract.isParent(address);
      const isChild = await contract.isChild(address);

      if (isParent) setRole("parent");
      else if (isChild) setRole("child");
      else setRole("");
    } catch (err) {
      console.error("Failed to check user role:", err);
    }
  };

  useEffect(() => {
    if (wallet) {
      checkUserRole(wallet);
    }
  }, [wallet]);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Crypto Allowance</h1>

      {!wallet ? (
        <div className="text-center">
          <p>
            Welcome to the Crypto Allowance App. Easily manage ETH allowances between parents and children.
          </p>
          <button className="btn btn-primary mt-3" onClick={connectWallet}>
            Login with MetaMask
          </button>
        </div>
      ) : (
        <>
          <p className="text-center text-muted">
            Wallet: <span className="text-light">{wallet}</span>
          </p>

          <div className="text-center mb-4">
            <button className="btn btn-outline-danger" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="card p-4 mb-4">
            <RoleRegistration wallet={wallet} />
          </div>

          {role === "parent" && (
            <div className="card p-4 mb-4">
              <ParentDashboard wallet={wallet} />
            </div>
          )}

          {role === "child" && (
            <div className="card p-4 mb-4">
              <ChildDashboard wallet={wallet} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
