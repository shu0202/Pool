import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";
import Transaction from "../utilities/transaction";

class TransactionManager {
    // Create a new transaction and save it to Firestore
    static async createTransaction(userId, type, amount, poolId = null) {
        const transactionId = `trans-${Math.random().toString(36).substr(2, 9)}`;
        const newTransaction = new Transaction(transactionId, userId, type, amount, poolId);
        await newTransaction.save();
        return newTransaction;
    }

    // Fetch a specific transaction by its ID from Firestore
    static async fetchTransactionById(transactionId) {
        const transactionRef = doc(FIREBASE_DB, "transactions", transactionId);
        const docSnap = await getDoc(transactionRef);
        if (!docSnap.exists()) {
            console.log("No such transaction exists!");
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
    }

    // Fetch all transactions for a specific user
    static async fetchTransactionsByUser(userId) {
        const q = query(collection(FIREBASE_DB, "transactions"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const transactions = [];
        querySnapshot.forEach((doc) => {
            const transaction = doc.data();
            transactions.push(new Transaction(
                transaction.transactionId,
                transaction.userId,
                transaction.type,
                transaction.amount,
                transaction.poolId,
                transaction.timestamp
            ));
        });
        return transactions;
    }

    // Additional methods to handle other transaction-related functionalities can be added here
}

export default TransactionManager;
