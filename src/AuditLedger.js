const crypto = require('crypto');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data; // ML prediction data, feature vector, outcome
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    /**
     * Calculates the cryptographic hash for the block (immutable signature).
     */
    calculateHash() {
        const dataString = JSON.stringify(this.data);
        return crypto.createHash('sha256').update(
            this.index + this.previousHash + this.timestamp + dataString
        ).digest('hex');
    }
}

class AuditLedger {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), { message: "Genesis Block: EthosGuard Ledger Initialized" }, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addPrediction(predictionData) {
        const latestBlock = this.getLatestBlock();
        const newBlock = new Block(
            latestBlock.index + 1,
            Date.now(),
            predictionData,
            latestBlock.hash
        );
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
        console.log(`[EthosGuard] Prediction logged and signed. Block Index: ${newBlock.index}`);
    }

    /**
     * Verifies the integrity of the entire chain.
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // 1. Check if the block's hash is valid (Data Tampering Check)
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.error(`❌ EthosGuard Integrity Breach: Block ${currentBlock.index} hash is invalid.`);
                return false;
            }

            // 2. Check if the 'previousHash' link is valid (Chain Tampering Check)
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error(`❌ EthosGuard Chain Breach: Block ${currentBlock.index} link is broken.`);
                return false;
            }
        }
        console.log('✅ EthosGuard Audit Ledger is valid and untampered.');
        return true;
    }
}

// --- Demonstration ---
const ledger = new AuditLedger();

// Log Prediction 1
ledger.addPrediction({ model_id: 'risk_v1', features: [0.8, 0.2], output: 0.95, outcome: 'approved' });

// Log Prediction 2 (Simulating a slight change in feature vector, or drift)
ledger.addPrediction({ model_id: 'risk_v1', features: [0.75, 0.25], output: 0.88, outcome: 'approved' });

console.log('\n--- EthosGuard: Integrity Verification ---');
ledger.isChainValid();

// --- Simulate a Tamper Attempt (Ethical Breach) ---
console.log('\n--- Simulating Tampering Attempt (Illegal Edit) ---');
ledger.chain[1].data.outcome = 'denied'; // Changing the outcome retroactively!
ledger.chain[1].hash = ledger.chain[1].calculateHash(); // Attacker tries to fix the hash

ledger.isChainValid(); // The verification will fail on block 2 because previousHash link is broken.

module.exports = { AuditLedger };
