// backend/utils/transactionCache.js

const cache = {};

/**
 * Save a new transaction for a child address.
 * @param {string} child - The child's wallet address.
 * @param {object} tx - Transaction object including from, amountEth, amountUsd, timestamp, txHash.
 */
function addTransaction(child, tx) {
    const lowerChild = child.toLowerCase();

    if (!cache[lowerChild]) {
        cache[lowerChild] = [];
    }

    // Store latest at top
    cache[lowerChild].unshift(tx);

    // Keep only latest 10
    if (cache[lowerChild].length > 10) {
        cache[lowerChild].pop();
    }
}

/**
 * Get recent transactions for a child wallet.
 * @param {string} child
 * @returns {Array}
 */
function getTransactions(child) {
    const lowerChild = child.toLowerCase();
    return cache[lowerChild] || [];
}

module.exports = {
    addTransaction,
    getTransactions,
};
