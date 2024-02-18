import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Dimensions  } from "react-native";
import Header from "../components/AppHeader"; // Adjust the import path as necessary
import { addDoc, getDocs, collection, doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";

const InvestmentPools = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paytime, setPaytime] = useState('');
  const [interest, setInterest] = useState('');
  const [pools, setPools] = useState([]); // State to hold fetched pools

  const headerOptions = {
    right: [
      {
        icon: "add-circle",
        onPress: () => setModalVisible(true),
      },
    ],
  };

  const handleSave = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      try {
        const newPool = {
          name,
          amount,
          paybacktime: paytime,
          creatorId: user.uid, // Include the ID of the current user
        };

        const docRef = await addDoc(
          collection(FIREBASE_DB, "FriendlyPools"),
          newPool
        );
        console.log("Document written with ID: ", docRef.id);

        setName("");
        setAmount("");
        setPaytime("");
        setInterest("");
        setModalVisible(false);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      console.error("No user logged in");
    }
};

const dismissKeyboard = () => {
  Keyboard.dismiss();
};

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(FIREBASE_DB, "investmentPools")
        );
        const fetchedPools = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPools(fetchedPools);
      } catch (error) {
        console.error("Error fetching pools:", error);
        // Set an error state or handle the error appropriately
        // For example, you could set an error message to display to the user
        setError("Failed to load investment pools.");
      }
    };

    fetchPools();
  }, []);


  return (
    <View style={styles.pageContainer}>
      <Header options={headerOptions} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.poolsOwned}>
          <Text style={styles.sectionTitle}>Pools Owned</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.horizontalScroll}
          >
            {pools.map((pool) => (
              <View key={pool.id} style={styles.pool}>
                <Text style={styles.poolText}>Name: {pool.name}</Text>
                <Text style={styles.poolText}>Amount: {pool.amount}</Text>
                <Text style={styles.poolText}>
                  Payback Time: {pool.paybacktime} days
                </Text>
                <Text style={styles.poolText}>
                  Pool Creator: {pool.creatorName}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.poolCategories}>
          <Text style={styles.sectionTitle}>Pool Categories</Text>
        </View>
        <View style={styles.myInvestments}>
          <Text style={styles.sectionTitle}>My Investments</Text>
        </View>
        <View style={styles.performanceAnalytics}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
        </View>
        <View style={styles.recommendedPools}>
          <Text style={styles.sectionTitle}>Recommended Pools</Text>
        </View>
        <View style={styles.legalDocuments}>
          <Text style={styles.sectionTitle}>Legal Agreements</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#022D3B",
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  poolsOwned: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  poolCategories: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  myInvestments: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  performanceAnalytics: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  recommendedPools: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  legalDocuments: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  // Additional styles for your app...
});

export default InvestmentPools;
