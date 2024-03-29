import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, Dimensions, Modal, TextInput, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Header from "../components/AppHeader";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";
import TouchableScale from "react-native-touchable-scale";
import { Ionicons } from '@expo/vector-icons';

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
    {/* Activity Centre Section */}
    <Text style={styles.activityCentreHeader}>Activity Centre:</Text>
    <View style={styles.activityCentreUnderline} />
    <View style={styles.dashboardSummary}>
      <Text style={styles.sectionTitle}>Dashboard Summary</Text>
      <Text style={styles.sectionText}>Total Amount: {totalAmount}</Text>
    </View>

      
        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        
        {/* Quick Actions Section */}
<View style={styles.quickActions}>
  <Text style={styles.mainHeader}>Quick Actions:</Text>
  <View style={styles.headerUnderline} />
  <Text style={styles.sectionDescription}>
    Top-up with just one tap:
  </Text>

  <TouchableOpacity
    style={styles.actionButton}
    onPress={() => setModalVisible(true)}
    activeOpacity={0.7}
  >
    <Ionicons name="arrow-up-circle-outline" size={24} color="#FFF" />
    <Text style={styles.actionButtonText}>Top-Up</Text>
  </TouchableOpacity>

  {/* Add more quick action buttons here if needed */}
</View>

        <View style={styles.myPoolsOverview}>
          <Text style={styles.sectionTitle}>My Pools Overview</Text>
        </View>
        <Text style={styles.activityCentreHeader}>Explore Opportunities:</Text>
    <View style={styles.activityCentreUnderline} />
    <Text style={styles.sectionDescriptionLeft}>
  Find new investment pools that match your interests and goals:
</Text>
        <View style={styles.discoverPools}>
          <Text style={styles.sectionTitle}>Discover Pools</Text>
        </View>
   

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
                <Text style={styles.topUpButtonText}>Top-Up</Text>
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
    padding: 70, // Increased padding for more space inside the modal
    borderRadius: 20, // Increased border radius for a more rounded look
    width: Dimensions.get('window').width * 0.7, // Make the modal wider
    alignItems: "center",
    shadowColor: "#000", // Adding shadow for a slick look
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    alignItems: 'center', // This ensures that all children are centered
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  dashboardSummary: {
    width: "90%",
    alignSelf: 'center', // Align the section in the center
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  notificationsSection: {
    width: "90%",
    alignSelf: 'center', // Align the section in the center
    minHeight: 100,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 10,
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

  sectionDescription: {
    fontSize: 16, // Smaller font size than the main headers
    color: '#7AD8F8',
    fontWeight: 'bold',
    marginBottom: 10, // Adds some space between the description and the box
    paddingHorizontal: Dimensions.get('window').width * 0, // Aligns text with the headers
  },

  quickActions: {
    width: "90%",
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#009688",
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 10, // Spacing between icon and text
  },

  headerUnderline: {
    height: 1, // Thin underline
    backgroundColor: '#FFFFFF', // White color for the underline
    width: '100%', // Span the full width of the container
    alignSelf: 'center',
    marginBottom: 20, // Space between the underline and the next content
    
  },
  mainHeader: {
    fontSize: 28, // Larger font size for main headers
    color: '#FFF',
    fontWeight: 'bold',
    paddingVertical: 20, // Adds vertical space above and below the header
    paddingHorizontal: Dimensions.get('window').width * 0.0, // 5% padding
  },

  activityCentreHeader: {
    fontSize: 28, // Adjust the font size as needed
    color: '#FFF',
    fontWeight: 'bold',
    paddingVertical: 20,
    width: '90%', // Match the width of the other sections
    alignSelf: 'center', // Center the title within the parent container
  },

  activityCentreUnderline: {
    height: 1, // Make the underline slightly thicker for emphasis if you like
    backgroundColor: '#FFFFFF',
    width: '90%', // Ensure it matches the width of the sections and the title above
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionDescriptionLeft: {
    fontSize: 16,
    color: '#7AD8F8', // Adjust color as needed
    fontWeight: 'normal', // Adjust based on your design
    marginBottom: 20,
    textAlign: 'left', // Ensures text is aligned to the left
    width: '90%', // Ensure it matches the width of your sections
    fontWeight: 'bold',
    alignSelf: 'center', // Centers the text block in its container
  },

  // Additional styles...
});

export default HomeScreen;