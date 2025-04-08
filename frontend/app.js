// frontend/app.js
document.getElementById("connectBtn").addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            const address = accounts[0];
            document.getElementById("walletAddress").innerText = `Wallet: ${address}`;
        } catch (err) {
            console.error(err);
        }
    } else {
        alert("MetaMask not detected!");
    }
});
