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
  import {
    addDoc,
    getDocs,
    collection,
    doc,
    getDoc,
    arrayUnion,
    updateDoc,
  } from "firebase/firestore";
  import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";
  import FriendlyPool from "../utilities/friendsPool";

  const FriendlyPools = () => {
    const [myContributions, setMyContributions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [contributionModalVisible, setContributionModalVisible] =
      useState(false);
    const [addContributionModalVisible, setAddContributionModalVisible] =
      useState(false);
    const [contributionAmount, setContributionAmount] = useState("");
    const [selectedContribution, setSelectedContribution] = useState({});
    const [hasActiveLoan, setHasActiveLoan] = useState(false);
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
        const poolPromises = querySnapshot.docs.map(async (docSnapshot) => {
          const pool = docSnapshot.data();
          pool.id = docSnapshot.id;

          // Fetch the creator's email using the creatorId
          const creatorRef = doc(FIREBASE_DB, "Users", pool.creatorId);
          const creatorDoc = await getDoc(creatorRef);
          pool.creatorEmail = creatorDoc.exists()
            ? creatorDoc.data().email
            : "Unknown";

          return pool;
        });

        const poolsData = await Promise.all(poolPromises);
        poolsData.sort((a, b) => b.createdAt - a.createdAt);
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
    }, [addToPool]);

    // Function to add a contribution to a pool
    // Function to add a contribution to a pool
    const addToPool = async (poolId, contributionAmount) => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (!user) {
          console.error("User must be logged in to contribute to a pool");
          return;
        }

        // Convert contributionAmount to a number and validate it
        const numericAmount = parseFloat(contributionAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          console.error("Invalid contribution amount");
          return;
        }

        // Fetch the current user's data
        const userRef = doc(FIREBASE_DB, "Users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          console.error("User not found in database");
          return;
        }
        const userData = userDoc.data();

        // Validate user's wallet amount before proceeding
        if (numericAmount > userData.amount) {
          console.error("Contribution amount exceeds user's wallet amount");
          return;
        }

        // Update user's wallet and investments
        const newUserAmount = userData.amount - numericAmount;
        const newUserInvestments = userData.investments + numericAmount;

        await updateDoc(userRef, {
          amount: newUserAmount,
          investments: newUserInvestments,
        });

        // Update the pool's total amount
        const poolRef = doc(FIREBASE_DB, "friendsPools", poolId);
        const poolDoc = await getDoc(poolRef);
        if (!poolDoc.exists()) {
          console.error("Pool not found in database");
          return;
        }
        const poolData = poolDoc.data();

        const newTotalAmount = poolData.totalAmount + numericAmount;
        await updateDoc(poolRef, {
          totalAmount: newTotalAmount,
        });

        console.log("Contribution added successfully to the pool");

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
        console.error("An error occurred while adding to the pool:", error);
      }
    };

    const handleSave = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        try {
          const newPool = new FriendlyPool(
            name,
            user.uid,
            0,
            paytime,
            [{ userId: user.uid, amount: 0 }],
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

    const dismissKeyboard = () => {
      Keyboard.dismiss();
    };

    const checkForActiveLoan = async (userId, poolId) => {
      const transactionsRef = collection(FIREBASE_DB, "Transactions");
      const querySnapshot = await getDocs(transactionsRef);
      const transactions = querySnapshot.docs.map((doc) => doc.data());
      // Assuming 'type' field is used to determine if the transaction is a loan
      const activeLoan = transactions.find(
        (transaction) =>
          transaction.userId === userId &&
          transaction.poolId === poolId &&
          transaction.type === "loan"
      );
      return !!activeLoan;
    };

    const fetchMyContributions = async () => {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        console.error("User must be logged in to fetch contributions");
        return;
      }

      try {
        const querySnapshot = await getDocs(
          collection(FIREBASE_DB, "friendsPools")
        );
        const myContributions = querySnapshot.docs
          .map((docSnapshot) => {
            const poolData = docSnapshot.data();
            const contributors = poolData.contributors || [];
            const userContribution = contributors.find(
              (contributor) => contributor.userId === userId
            );

            if (userContribution) {
              return {
                id: docSnapshot.id,
                poolName: poolData.poolName,
                amountContributed: userContribution.amount, // Assuming amountContributed is stored in the contributors array
                totalPoolWorth: poolData.totalAmount, // Assuming totalAmount represents the total pool worth
              };
            } else {
              return null;
            }
          })
          .filter(Boolean);

        setMyContributions(myContributions);
      } catch (error) {
        console.error("Error fetching user contributions:", error);
      }
    };

    useEffect(() => {
      fetchMyContributions();
    }, [addToPool]);

    const openContributionDetails = async (contribution) => {
      const activeLoan = await checkForActiveLoan(userId, contribution.id);
      setHasActiveLoan(activeLoan);
      setSelectedContribution(contribution);
      setContributionModalVisible(true);
    };

    // Assuming you've authenticated and have the current user's ID
    const user = FIREBASE_AUTH.currentUser;
    const userId = user?.uid;

    // Open pool details modal
    const openPoolDetails = (pool) => {
      setSelectedPool(pool);
      setPoolModalVisible(true);
    };

    // Use calculateTotalAmount(pool.contributors) wherever you need the total amount

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
                  <Text style={styles.poolText}>
                    Pool Worth: £{pool.totalAmount}
                  </Text>
                  <Text style={styles.poolText}>
                    Payback Time: {pool.paybackTime} days
                  </Text>
                  <Text style={styles.poolText}>
                    Pool Creator: {pool.creatorEmail}
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
              {pools.map((pool) => {
                const userContribution = pool.contributors.find(
                  (contributor) => contributor.userId === userId
                );
                return (
                  <TouchableOpacity
                    key={pool.id}
                    style={styles.contributionItem}
                    onPress={() =>
                      openContributionDetails({
                        id: pool.id,
                        poolName: pool.poolName,
                        amountContributed: userContribution?.amount,
                        totalPoolWorth: pool.totalAmount,
                        poolCreator: pool.creatorEmail,
                      })
                    }
                  >
                    <Text style={styles.contributionText}>
                      Pool Name: {pool.poolName}
                    </Text>
                    <Text style={styles.contributionText}>
                      Amount Contributed: £{userContribution?.amount}
                    </Text>
                    <Text style={styles.contributionText}>
                      Total Pool Worth: £{pool.totalAmount}
                    </Text>
                    <Text style={styles.contributionText}>
                      Pool Creator: {pool.creatorEmail}
                    </Text>
                  </TouchableOpacity>
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

        {/* MODALS ARE BELOW HERE */}

        <Modal
          visible={contributionModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setContributionModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {selectedContribution.poolName} Details
              </Text>
              {/* Display selected contribution details */}
              <Text>Amount Contributed: £{selectedContribution.amount}</Text>
              <Text>
                Total Pool Worth: £{selectedContribution.totalPoolWorth}
              </Text>
              <Text>Pool Creator: {selectedContribution.poolCreator}</Text>

              {/* Input for new contribution amount */}
              <TextInput
                style={styles.inputContainer}
                placeholder="Enter amount"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={contributionAmount}
                onChangeText={setContributionAmount}
              />

              {/* Button to add contribution */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  addToPool(selectedContribution.id, contributionAmount);
                  setContributionAmount(""); // Reset input field
                  setContributionModalVisible(false); // Optionally close modal or keep open
                }}
              >
                <Text style={styles.actionButtonText}>ADD TO POOL</Text>
              </TouchableOpacity>

              {/* Existing action buttons */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => withdrawContributions(selectedContribution.id)}
              >
                <Text style={styles.actionButtonText}>
                  WITHDRAW CONTRIBUTIONS
                </Text>
              </TouchableOpacity>

              {selectedContribution.hasActiveLoan ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.paybackLoanButton]}
                  onPress={() => payBackLoan(selectedContribution.id)}
                >
                  <Text style={styles.actionButtonText}>PAY BACK LOAN</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => borrow(selectedContribution.id)}
                >
                  <Text style={styles.actionButtonText}>BORROW</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setContributionModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
              <Text>Payback Time: {selectedPool.paybackTime} days</Text>
              <Text>Pool Creator: {selectedPool.creatorEmail}</Text>
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
