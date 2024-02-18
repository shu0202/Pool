import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig"; // Adjust this path as necessary
import Header from "../components/AppHeader";

const InvestmentPools = () => {
  const [pools, setPools] = useState([]); // State to hold fetched pools
  const [error, setError] = useState(null);

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

  const headerOptions = {
    right: [
      {
        icon: "add-circle",
        onPress: () => setModalVisible(true),
      },
    ],
  };

  const handleSave = async () => {
    try {
      // Create a new document object
      const newPool = {
        name: name,
        amount: amount,
        interest: interest,
        paybacktime: paytime,
      };

      // Add the document to the "FriendlyPool" collection
      const docRef = await addDoc(collection(FIREBASE_DB, "InvestmentPools"), newPool);
      console.log("Document written with ID: ", docRef.id);

      // Clear the input fields and close the modal
      setName('');
      setAmount('');
      setPaytime('');
      setInterest('');
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.pageContainer}>
      <Header options={headerOptions} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.activePools}>
          <Text style={styles.sectionTitle}>Active Pools</Text>
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
              <TouchableOpacity style={styles.backButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Pool</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={name}
                  onChangeText={text => setName(text)}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  value={amount}
                  onChangeText={text => setAmount(text)}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Paytime:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Paytime"
                  value={paytime}
                  onChangeText={text => setPaytime(text)}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Interest:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Interest"
                  value={interest}
                  onChangeText={text => setInterest(text)}
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

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: "#022D3B",
    position: "absolute",
    top: "10%",
    left: "10%",
    padding: 10,
    zIndex: 999,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
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
  activePools: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  myContributions: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  pendingRequests: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  subPools: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
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

export default InvestmentPools;
