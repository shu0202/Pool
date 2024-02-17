import { FIREBASE_DB } from "../../firebaseConfig"; // Adjust this path
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

// Helper function to format Firestore Timestamp to a simple date string 'YYYY-MM-DD'
const formatDate = (timestamp) => {
  const date = timestamp.toDate();
  return date.toISOString().split("T")[0];
};

// Fetch and process investment data
export const fetchInvestmentData = async (poolId) => {
  const q = query(
    collection(FIREBASE_DB, "transactions"),
    where("poolId", "==", poolId),
    orderBy("timestamp", "asc")
  );

  const querySnapshot = await getDocs(q);
  let investmentData = {};
  let totalInvested = 0; // Initialize total invested amount

  querySnapshot.forEach((doc) => {
    const { amount, timestamp } = doc.data();
    const dateStr = formatDate(timestamp);

    if (investmentData[dateStr]) {
      investmentData[dateStr] += amount;
    } else {
      investmentData[dateStr] = amount;
    }

    totalInvested += amount; // Accumulate total invested amount
  });

  const graphData = Object.keys(investmentData).map((date) => ({
    date,
    amount: investmentData[date],
  }));

  return { graphData, totalInvested }; // Return both graph data and total invested amount
};

