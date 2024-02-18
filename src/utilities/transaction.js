import { doc, setDoc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "./path_to_your_firebase_config"; // Adjust the path to where you've defined FIREBASE_DB

class Transaction {
    constructor(transactionId, userId, type, amount, poolId = null, timestamp = new Date()) {
        this.transactionId = transactionId;
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.poolId = poolId;
        this.timestamp = timestamp;
    }

    // Convert transaction object to a Firestore-friendly format
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
            const transactionRef = doc(FIREBASE_DB, 'transactions', this.transactionId);
            await setDoc(transactionRef, this.toFirestore());
            console.log("Transaction successfully saved to Firestore!");
        } catch (error) {
            console.error("Error saving Transaction to Firestore: ", error);
            // Handle the error appropriately
        }
    }

    // Static method to fetch a transaction by ID from Firestore
    static async fetchById(transactionId) {
        try {
            const transactionRef = doc(FIREBASE_DB, 'transactions', transactionId);
            const docSnap = await getDoc(transactionRef);
            if (!docSnap.exists()) {
                console.log('No such transaction!');
                return null;
            } else {
                const transactionData = docSnap.data();
                return new Transaction(
                    transactionData.transactionId,
                    transactionData.userId,
                    transactionData.type,
                    transactionData.amount,
                    transactionData.poolId,
                    transactionData.timestamp
                );
            }
        } catch (error) {
            console.error("Error fetching Transaction from Firestore: ", error);
            // Handle the error appropriately
            return null;
        }
    }
}
