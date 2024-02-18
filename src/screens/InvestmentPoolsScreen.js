import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Dimensions  } from "react-native";
import Header from "../components/AppHeader"; // Adjust the import path as necessary
import { addDoc, getDocs, collection, doc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";
import InvestmentPool from "../utilities/investmentPool";
import FriendlyPool from "../utilities/friendsPool";

const InvestmentPools = () => {
  const [myContributions, setMyContributions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [poolModalVisible, setPoolModalVisible] = useState(false);
  const [selectedPool, setSelectedPool] = useState({});
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paytime, setPaytime] = useState("");
  const [interest, setInterest] = useState("");
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
    const poolRef = doc(FIREBASE_DB, "InvestmentPools", poolId);

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
          collection(FIREBASE_DB, "InvestmentPools")
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
      const poolRef = doc(FIREBASE_DB, "InvestmentPools", poolId);
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



  const updateContribution = async (poolId, userId, newContributionAmount) => {
    const poolRef = doc(FIREBASE_DB, "InvestmentPools", poolId);

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

  const fetchMyContributions = async () => {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      console.error("User must be logged in to fetch contributions");
      return;
    }

    try {
      const querySnapshot = await getDocs(
          collection(FIREBASE_DB, "InvestmentPools")
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
              };} else {
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

  const openPoolDetails = (pool) => {
    setSelectedPool(pool);
    setPoolModalVisible(true);
  };

  const calculateTotalAmount = (contributors) => {
    return contributors.reduce(
        (sum, contributor) => sum + (contributor.amountContributed || 0),
        0
    );
  };

  return (
    <View style={styles.pageContainer}>
      <Header options={headerOptions} />
      <ScrollView contentContainerStyle={styles.contentContainer}>

        {/* Investment Management Section */}
    <Text style={styles.mainHeader}> Management:</Text>
    <View style={styles.headerUnderline} />
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
        <Text style={styles.sectionDescription}>
        Review active investment history & returns:

</Text>
        <View style={styles.myInvestments}>
          <Text style={styles.sectionTitle}>My Investments</Text>
        </View>
        <Text style={styles.sectionDescription}>
        Insights into investment trends & success rates:
</Text>
        <View style={styles.performanceAnalytics}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
        </View>
        {/* Pool Discovery Section */}
        <Text style={styles.mainHeader}>Pool Discovery:</Text>
        <View style={styles.headerUnderline} />
<Text style={styles.sectionDescription}>
  Explore and join pools curated based on your investment preferences:
</Text>
<View style={styles.poolDiscoveryContainer}>
  <View style={styles.halfWidthContainer}>
    <Text style={styles.sectionTitle}>Pool Categories</Text>
    {/* Content for Pool Categories */}
  </View>

  <View style={styles.halfWidthContainer}>
    <Text style={styles.sectionTitle}>Suggested Pools</Text>
    {/* Content for Recommended Pools */}
  </View>
</View>
         {/* Legal & Support Section */}
    <Text style={styles.mainHeader}>Legal & Support:</Text>
    <View style={styles.headerUnderline} />
    <Text style={styles.sectionDescription}>
    Review terms, conditions, and agreements for your investments:
</Text>
        <View style={styles.legalDocuments}>
          <Text style={styles.sectionTitle}>Legal Agreements</Text>
          <Text style={styles.legalText}>
    Please read these terms and conditions carefully before using Our Service.
  </Text>
  <Text style={styles.legalText}>
    {/* Additional text blocks */}
  </Text>
  <Text style={styles.legalText}>
    If you have any questions about these Terms, please contact us.
  </Text>
  <Text style={styles.legalText}>
    This text is for illustrative purposes only.
  </Text>
  <Text style={styles.legalText}>
  By accessing or using the Service, You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions, then You may not access the Service.
  </Text>
  <Text style={styles.legalText}>
  Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.
  </Text>
  <Text style={styles.legalText}>
  The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such web sites or services.
  </Text>
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
  mainHeader: {
    fontSize: 28, // Larger font size for main headers
    color: '#FFF',
    fontWeight: 'bold',
    paddingVertical: 20, // Adds vertical space above and below the header
    paddingHorizontal: Dimensions.get('window').width * 0.05, // 5% padding
  },
  headerUnderline: {
    height: 1, // Thin underline
    backgroundColor: '#FFFFFF', // White color for the underline
    width: '90%', // Span the full width of the container
    alignSelf: 'center',
    marginBottom: 20, // Space between the underline and the next content
    
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
    width: '90%', // Change this to adjust the width
    alignSelf: 'center', // This centers the rectangle in the view
  },
  poolCategories: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '90%', // Change this to adjust the width
    alignSelf: 'center', // This centers the rectangle in the view
  },
  myInvestments: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '90%', // Change this to adjust the width
    alignSelf: 'center', // This centers the rectangle in the view
  },
  performanceAnalytics: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '90%', // Change this to adjust the width
    alignSelf: 'center', // This centers the rectangle in the view
  },
  recommendedPools: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '90%', // Change this to adjust the width
    alignSelf: 'center', // This centers the rectangle in the view
  },
  legalDocuments: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '90%', // Change this to adjust the width
    alignSelf: 'center', // This centers the rectangle in the view
  },
  sectionDescription: {
    fontSize: 16, // Smaller font size than the main headers
    color: '#7AD8F8',
    fontWeight: 'bold',
    marginBottom: 10, // Adds some space between the description and the box
    paddingHorizontal: Dimensions.get('window').width * 0.05, // Aligns text with the headers
  },
  // Additional styles for your app...

  poolDiscoveryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%', // This will set the container to 90% of its parent's width
    alignSelf: 'center', // This will center the container on the screen
  },
  halfWidthContainer: {
    width: '48%', // Each child takes up roughly half of the poolDiscoveryContainer's width
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 20,
    borderRadius: 20,
    // Adjust the space between the two child containers if needed
  },
});

export default InvestmentPools;
