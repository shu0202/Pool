import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from '../components/AppHeader'; // Adjust the import path as necessary

const FriendlyPools = () => {
    const headerOptions = {
      left: [
        { text: "Settings", onPress: () => navigation.navigate("Settings") }, // Navigate to SettingsPage
      ],
      right: [
        {
          text: "Notifications",
          onPress: () => console.log("Notifications Pressed"),
        },
      ],
    };

  return (
    <View style={{ flex: 1 }}>
      <Header options={headerOptions} />
      <View style={styles.container}>
        <Text style={styles.text}>Friendly Pools</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default FriendlyPools;
