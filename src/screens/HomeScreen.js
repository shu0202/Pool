import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, Dimensions, Modal, TextInput, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Header from "../components/AppHeader";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";
import TouchableScale from "react-native-touchable-scale";

const HomeScreen = ({ navigation }) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");

  const handleTopUpAmount = (text) => {
    setTopUpAmount(text);
  };

  useEffect(() => {
    const fetchUserAmount = async () => {
      try {
        const userDoc = doc(FIREBASE_DB, "Users", FIREBASE_AUTH.currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();
        const amount = userData.amount; // Assuming the field name is "amount" in Firestore

        setTotalAmount(amount);
      } catch (error) {
        console.log("Error fetching user amount:", error);
      }
    };

    fetchUserAmount();
  }, []);

  const headerOptions = {
    left: [
      {
        icon: "settings",
        onPress: () => navigation.navigate("Settings"),
      },
    ],
    right: [
      {
        icon: "notifications",
        onPress: () => console.log("Notifications Pressed"),
      },
    ],
  };

  const handleTopUp = async () => {
    try {
      // Calculate the new total amount after top-up
      const newTotalAmount = totalAmount + parseInt(topUpAmount);

      // Update the amount in Firestore
      const userDoc = doc(FIREBASE_DB, "Users", FIREBASE_AUTH.currentUser.uid);
      await updateDoc(userDoc, { amount: newTotalAmount });

      // Update the local state
      setTotalAmount(newTotalAmount);

      // Close the modal
      setModalVisible(false);
    } catch (error) {
      console.log("Error updating user amount:", error);
    }
  };


  return (
    <View style={styles.pageContainer}>
      <Header options={headerOptions} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.dashboardSummary}>
          <Text style={styles.sectionTitle}>Dashboard Summary</Text>
          <Text style={styles.sectionText}>Total Amount: {totalAmount}</Text>
        </View>
        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        <View style={styles.myPoolsOverview}>
          <Text style={styles.sectionTitle}>My Pools Overview</Text>
        </View>
        <View style={styles.discoverPools}>
          <Text style={styles.sectionTitle}>Discover Pools</Text>
        </View>
        <TouchableScale
          style={styles.plusButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableScale>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Top-Up Amount</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                onChangeText={handleTopUpAmount}
                value={topUpAmount}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.topUpButton}
                onPress={handleTopUp}
              >
                <Text style={styles.topUpButtonText}>Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  amountInput: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  topUpButton: {
    backgroundColor: "#009688",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  topUpButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#CCC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  plusButton: {
    position: "absolute",
    bottom: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#009688",
    justifyContent: "center",
    alignItems: "center",
  },
  plusButtonText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  pageContainer: {
    flex: 1,
    backgroundColor: "#022D3B",
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  dashboardSummary: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  notificationsSection: {
    width: "90%",
    minHeight: 100,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  myPoolsOverview: {
    width: "90%",
    minHeight: 150,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  discoverPools: {
    width: "90%",
    minHeight: 120,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    borderRadius: 20,
    marginBottom: "20%",
  },
  communityFeatures: {
    width: "90%",
    minHeight: 140,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  // Additional styles...
});

export default HomeScreen;