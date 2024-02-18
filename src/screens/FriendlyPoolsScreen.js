import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import Header from "../components/AppHeader";
import { addDoc, getDocs, collection, doc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";
import FriendlyPool from "../utilities/friendsPool";

const FriendlyPools = () => {
  const [myContributions, setMyContributions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [poolModalVisible, setPoolModalVisible] = useState(false);
  const [selectedPool, setSelectedPool] = useState({});
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paytime, setPaytime] = useState("");
  const [interest, setInterest] = useState("");
  const [pools, setPools] = useState([]);

  const headerOptions = {
    right: [
      {
        icon: "add-circle",
        onPress: () => setModalVisible(true),
      },
    ],
  };

  const joinPool = async (poolId, contributionAmount) => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      console.error("User must be logged in to join a pool");
      return;
    }

    // Construct contributor object
    const newContributor = {
      userId: user.uid,
      amount: 0,
    };

    // Get a reference to the pool
    const poolRef = doc(FIREBASE_DB, "friendsPools", poolId);

    try {
      // Atomically add a new contributor to the "contributors" array field
      await updateDoc(poolRef, {
        contributors: arrayUnion(newContributor),
      });
      console.log("User successfully joined pool");

      // Close the modal
      setPoolModalVisible(false);

      // Fetch the updated pool data and update the state
      const updatedPool = await fetchSinglePool(poolId);
      setPools((prevPools) =>
        prevPools.map((pool) => (pool.id === poolId ? updatedPool : pool))
      );

      // Optionally, if you want to update the 'myContributions' state as well:
      setMyContributions((prevContributions) => {
        const existing = prevContributions.find((p) => p.id === poolId);
        if (existing) {
          return prevContributions.map((p) =>
            p.id === poolId ? updatedPool : p
          );
        } else {
          return [...prevContributions, updatedPool];
        }
      });
    } catch (error) {
      console.error("Error joining pool: ", error);
    }
  };


  const fetchPools = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(FIREBASE_DB, "friendsPools")
      );
      const poolsData = querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setPools(poolsData);
    } catch (error) {
      console.error("Error fetching pools: ", error);
    }
  };

  const fetchSinglePool = async (poolId) => {
    try {
      const poolRef = doc(FIREBASE_DB, "friendsPools", poolId);
      const poolDoc = await getDoc(poolRef);
      if (poolDoc.exists()) {
        return { id: poolDoc.id, ...poolDoc.data() };
      } else {
        throw new Error("Pool does not exist.");
      }
    } catch (error) {
      console.error("Error fetching single pool: ", error);
      throw error;
    }
  };


  useEffect(() => {
    fetchPools();
  }, []);


  const handleSave = async () => {
  const user = FIREBASE_AUTH.currentUser;
  if (user) {
    try {
      const newPool = new FriendlyPool(
        name,
        user.uid,
        0,
        paytime,
        [{ userId: user.uid, amountContributed: 0 }],
        []
      );
      await newPool.saveToFirestore();

      // Reset form and update UI as necessary
      setName("");
      setAmount("");
      setPaytime("");
      setModalVisible(false);
      fetchPools(); // Re-fetch pools to get the updated list
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  } else {
    console.error("No user logged in");
  }
};

  const updateContribution = async (poolId, userId, newContributionAmount) => {
    const poolRef = doc(FIREBASE_DB, "friendsPools", poolId);

    try {
      // Prepare the update object. This uses the Firestore field value syntax to update nested fields.
      const updateObject = {};
      updateObject[`contributions.${userId}`] = newContributionAmount;

      await updateDoc(poolRef, updateObject);
      console.log("Contribution updated successfully");
    } catch (error) {
      console.error("Error updating contribution: ", error);
    }
  };


  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(FIREBASE_DB, "friendsPools")
        );
        const poolsData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const pool = docSnapshot.data();
            pool.id = docSnapshot.id; // Attach the ID for key prop usage
            if (pool.creatorId) {
              const creatorRef = doc(FIREBASE_DB, "Users", pool.creatorId);
              const creatorDoc = await getDoc(creatorRef);
              pool.creatorName = creatorDoc.exists()
                ? creatorDoc.data().email
                : "Unknown";
            } else {
              pool.creatorName = "Unknown";
            }
            return pool;
          })
        );

        // Sort pools by createdAt timestamp, newest first
        poolsData.sort((a, b) => b.createdAt - a.createdAt);

        setPools(poolsData);
      } catch (error) {
        console.error("Error fetching pools: ", error);
      }
    };

    fetchPools();
  }, []);

   useEffect(() => {
     const fetchMyContributions = async () => {
       const userId = FIREBASE_AUTH.currentUser?.uid;
       if (!userId) {
         console.error("User must be logged in to fetch contributions");
         return;
       }

       const querySnapshot = await getDocs(
         collection(FIREBASE_DB, "friendsPools")
       );
       const allPools = querySnapshot.docs.map((docSnapshot) => ({
         id: docSnapshot.id,
         ...docSnapshot.data(),
       }));

       // Filter pools to find ones where the current user is a contributor
       const myContributions = allPools.filter(
         (pool) =>
           pool.contributors &&
           pool.contributors.some(
             (contributor) => contributor.userId === userId
           )
       );

       // Assuming you have a state to store user's contributions
       setMyContributions(myContributions);
     };

     fetchMyContributions();
   }, []);

   // Assuming you've authenticated and have the current user's ID
   const user = FIREBASE_AUTH.currentUser;
   const userId = user?.uid;


  const calculateTotalContributions = (contributions) => {
    return Object.values(contributions).reduce(
      (total, amount) => total + amount,
      0
    );
  };


  // Open pool details modal
  const openPoolDetails = (pool) => {
    setSelectedPool(pool);
    setPoolModalVisible(true);
  };

  return (
    <View style={styles.pageContainer}>
      <Header options={headerOptions} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.activePools}>
          <Text style={styles.sectionTitle}>Open Friendly Pools</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.horizontalScroll}
          >
            {pools.map((pool) => (
              <TouchableOpacity
                key={pool.id}
                style={styles.pool}
                onPress={() => openPoolDetails(pool)}
              >
                <Text style={styles.poolText}>Name: {pool.poolName}</Text>
                <Text style={styles.poolText}>Pool Worth: £{pool.totalAmount}</Text>
                <Text style={styles.poolText}>
                  Payback Time: {pool.paybackTime} days
                </Text>
                <Text style={styles.poolText}>
                  Pool Creator: {pool.creatorName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.myContributionsContainer}>
          <Text style={styles.sectionTitle}>My Contributions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.horizontalScroll}
          >
            {myContributions.map((pool) => {
              const userContribution = pool.contributors.find(
                (contributor) => contributor.userId === userId
              );
              return (
                <View key={pool.id} style={styles.contributionItem}>
                  <Text style={styles.contributionText}>
                    Pool Name: {pool.poolName}
                  </Text>
                  <Text style={styles.contributionText}>
                    Amount Contributed: £{userContribution?.amountContributed}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.pendingRequests}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
        </View>
        <View style={styles.subPools}>
          <Text style={styles.sectionTitle}>Sub-Pools</Text>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.centeredView}>
            <View style={styles.modalContainer}>
              {/* Modal Title */}
              <Text style={styles.modalTitle}>Create New Pool</Text>

              {/* Name Input */}
              <TextInput
                style={styles.inputContainer}
                placeholder="Pool Name"
                placeholderTextColor="#888" // Added for better visibility
                value={name}
                onChangeText={setName}
              />

              {/* Paytime Input */}
              <TextInput
                style={styles.inputContainer}
                placeholder="Re-Pay Time (days)"
                placeholderTextColor="#888" // Added for better visibility
                keyboardType="numeric"
                value={paytime}
                onChangeText={setPaytime}
              />

              {/* Save Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSave}
              >
                <Text style={styles.actionButtonText}>Save Pool</Text>
              </TouchableOpacity>

              {/* Close Modal Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={poolModalVisible}
        animationType="slide"
        onRequestClose={() => setPoolModalVisible(false)}
        transparent={true} // Ensures the modal's background is transparent
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedPool.name}</Text>
            {/* Pool details and actions */}
            <Text>Total In Pool: £{selectedPool.totalAmount}</Text>
            <Text>Total Invested: £</Text>
            <Text>Payback Time: {selectedPool.paybackTime} days</Text>
            <Text>Pool Creator: {selectedPool.creatorName}</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                joinPool(
                  selectedPool.id /* Specify the contribution amount here */
                )
              }
            >
              <Text style={styles.actionButtonText}>JOIN OPEN FRIENDLY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPoolModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
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
    marginHorizontal: 5,
    width: 150,
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
  modalContainer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: windowWidth * 0.8, // 80% of window width
    alignSelf: "center", // This ensures the modal is centered in its parent
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#022D3B",
    marginBottom: 15,
  },
  inputContainer: {
    width: "80%",
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#F0F0F0", // Light grey background for input
    borderRadius: 10,
    fontSize: 16,
  },
  input: {
    color: "black",
  },
  actionButton: {
    backgroundColor: "#022D3B",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: "80%",
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "grey",
    padding: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  myContributionsContainer: {
    // Add styling similar to 'activePools' to make it visually consistent
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 20,
    paddingHorizontal: 5,
    borderRadius: 20,
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
  },
  horizontalScroll: {
    // This style will be used to layout the children of the ScrollView
    alignItems: "center",
    paddingStart: 5,
    paddingEnd: 5,
  },
  contributionItem: {
    // Each contribution item will be styled to appear as cards or tiles
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    width: 180, // You can adjust the width as needed
    // Add elevation or shadow for better appearance
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contributionText: {
    // Style for the text inside each contribution item
    color: "#022D3B",
    fontSize: 16,
    marginBottom: 5, // Add some margin between text elements
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FriendlyPools;
