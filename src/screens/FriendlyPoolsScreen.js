import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Dimensions  } from "react-native";
import Header from "../components/AppHeader"; // Adjust the import path as necessary
import { addDoc, getDocs, collection, doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";

const FriendlyPools = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paytime, setPaytime] = useState('');
  const [interest, setInterest] = useState('');
  const [pools, setPools] = useState([]);

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
        // Get the snapshot of the FriendlyPools collection
        const querySnapshot = await getDocs(
          collection(FIREBASE_DB, "FriendlyPools")
        );
        // Process each document in the snapshot
        const poolsData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const pool = docSnapshot.data();
            // Check if creatorId exists and is not undefined
            if (pool.creatorId) {
              // Create a reference to the user document
              const creatorRef = doc(FIREBASE_DB, "Users", pool.creatorId);
              // Fetch the document
              const creatorDoc = await getDoc(creatorRef);
              // Check if the document exists and has an email field
              if (creatorDoc.exists() && creatorDoc.data().email) {
                return {
                  ...pool,
                  id: docSnapshot.id,
                  creatorName: creatorDoc.data().email,
                };
              } else {
                return {
                  ...pool,
                  id: docSnapshot.id,
                  creatorName: "Unknown",
                };
              }
            } else {
              return {
                ...pool,
                id: docSnapshot.id,
                creatorName: "Unknown",
              };
            }
          })
        );
        // Update the state with the fetched data
        setPools(poolsData);
      } catch (error) {
        console.error("Error fetching pools: ", error);
      }
    };

    fetchPools();
  }, []);





  return (
    <View style={styles.pageContainer}>
      <Header options={headerOptions} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.activePools}>
          <Text style={styles.sectionTitle}>Active Pools</Text>
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

        <View style={styles.myContributions}>
          <Text style={styles.sectionTitle}>My Contributions</Text>
        </View>
        <View style={styles.pendingRequests}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
        </View>
        <View style={styles.subPools}>
          <Text style={styles.sectionTitle}>Sub-Pools</Text>
        </View>
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Pool</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={(text) => setName(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount:</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                value={amount}
                onChangeText={(text) => setAmount(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Paytime:</Text>
              <TextInput
                style={styles.input}
                placeholder="Paytime"
                value={paytime}
                onChangeText={(text) => setPaytime(text)}
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#022D3B",
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  pool: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5, // Add some spacing between items
    width: 150, // Set a fixed width for each pool item
    // Add any additional styles you need
  },
  poolText: {
    color: "#022D3B",
    fontSize: 16,
  },
  activePools: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: "90%",
  },
  myContributions: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: "90%",
  },
  pendingRequests: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: "90%",
  },
  subPools: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: "90%",
  },
  
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#022D3B", // Light grey background
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  saveButton: {
    backgroundColor: "#022D3B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 16,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "70%",
  },

  // Additional styles for the rest of your app...
});

export default FriendlyPools;
