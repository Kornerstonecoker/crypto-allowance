// src/AllowanceChecker.js
import React, { useEffect, useState } from "react";

function AllowanceChecker({ wallet }) {
    const [allowance, setAllowance] = useState(null);

    useEffect(() => {
        if (wallet) {
            fetch(`http://localhost:5000/allowance/${wallet}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.allowance) {
                        setAllowance(data.allowance);
                    } else {
                        setAllowance("0");
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch allowance:", err);
                });
        }
    }, [wallet]);

    return (
        <div>
            <h3>Allowance</h3>
            {allowance !== null ? (
                <p>{allowance} ETH</p>
            ) : (
                <p>Loading allowance...</p>
            )}
        </div>
    );
}

export default AllowanceChecker;
