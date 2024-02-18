import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

class Transaction {
    constructor(transactionId, userId, type, amount, poolId = null, timestamp = new Date()) {
        this.transactionId = transactionId;
        this.userId = userId;
        this.type = type; // Types might include 'contribution', 'withdrawal', 'loan', etc.
        this.amount = amount;
        this.poolId = poolId; // Optional: associated with a specific pool
        this.timestamp = timestamp;
    }

    // Convert the transaction object to a Firestore-friendly format
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

    // Save the transaction to Firestore
    async save() {
        try {
            const transactionRef = doc(FIREBASE_DB, "transactions", this.transactionId);
            await setDoc(transactionRef, this.toFirestore());
            console.log("Transaction successfully saved to Firestore.");
        } catch (error) {
            console.error("Error saving transaction to Firestore:", error);
        }
    }

    // Additional methods or static functions to fetch transactions could be added here
}

export default Transaction;
