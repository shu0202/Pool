import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import Header from "../components/AppHeader"; // Adjust the import path as necessary

const FriendlyPools = () => {
  const headerOptions = {
    right: [
      {
        icon: "add-circle",
        onPress: () => console.log("Add Icon Pressed"),
      },
    ],
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
  // Additional styles for the rest of your app...
});

export default FriendlyPools;
