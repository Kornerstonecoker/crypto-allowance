// src/App.js
import React, { useState } from "react";
import AllowanceChecker from "./AllowanceChecker";
import RoleRegistration from "./RoleRegistration";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [wallet, setWallet] = useState("");

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

  return (
    <div className="container py-5 text-center">
      <h1 className="mb-4">Crypto Allowance</h1>

      {!wallet && (
        <button onClick={connectWallet} className="btn btn-primary mb-3">
          Login with MetaMask
        </button>
      )}

      {wallet && <p className="text-muted">Wallet: {wallet}</p>}

      {/* 👇 Role registration and allowance checker */}
      {wallet && <RoleRegistration />}
      {wallet && <AllowanceChecker wallet={wallet} />}
    </div>
  );
}

export default App;
