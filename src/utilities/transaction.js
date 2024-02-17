class Transaction {
    constructor(transactionId, userId, type, amount, poolId = null, timestamp = new Date()) {
        this.transactionId = transactionId; // Unique identifier for the transaction
        this.userId = userId; // UserID of the user involved in the transaction
        this.type = type; // Type of transaction (e.g., 'investment', 'loan', 'repayment', 'wallet-update')
        this.amount = amount; // Amount of money involved in the transaction
        this.poolId = poolId; // Optional: ID of the pool involved in the transaction (for investments/loans)
        this.timestamp = timestamp; // Timestamp of the transaction
    }

    // Convert transaction object to a database-friendly format
    toFirestore() {
        return {
            transactionId: this.transactionId,
            userId: this.userId,
            type: this.type,
            amount: this.amount,
            poolId: this.poolId,
            timestamp: this.timestamp
        };
    }

    // method to save the transaction to the database
    async save() {
        const db = admin.firestore();
        const transactionRef = db.collection('transactions').doc(this.transactionId);
        await transactionRef.set(this.toFirestore());
    }

    // Static method to fetch a transaction by ID
    static async fetchById(transactionId) {
        const db = admin.firestore();
        const transactionRef = db.collection('transactions').doc(transactionId);
        const doc = await transactionRef.get();
        if (!doc.exists) {
            console.log('No such transaction!');
            return null;
        } else {
            const transactionData = doc.data();
            return new Transaction(transactionData.transactionId, transactionData.userId, transactionData.type, transactionData.amount, transactionData.poolId, transactionData.timestamp);
        }
    }
}