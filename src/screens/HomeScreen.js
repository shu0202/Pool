import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Header from "../components/AppHeader";
import { fetchInvestmentData } from "../utilities/calcTotalInvest"; // Adjust the import path

const HomeScreen = ({ navigation }) => {
  const [totalInvested, setTotalInvested] = useState(0);

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


  return (
    <View style={styles.pageContainer}>
      <Header options={headerOptions} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.dashboardSummary}>
          <Text style={styles.sectionTitle}>Dashboard Summary</Text>
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
    marginBottom: 20,
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