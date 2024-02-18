import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import Header from "../components/AppHeader"; // Ensure this path matches your project structure

const InvestmentPools = () => {
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
  poolCategories: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  myInvestments: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  performanceAnalytics: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  recommendedPools: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  legalDocuments: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  // Additional styles for your app...
});

export default InvestmentPools;
