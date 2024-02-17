import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import Header from '../components/AppHeader'; // Adjust the import path as necessary

const auth = FIREBASE_AUTH;

const HomeScreen = ({ navigation }) => {
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
        <Text style={styles.welcomeText}>Welcome to the Home Screen!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#022D3B",
  },
  welcomeText: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#DD4B39", // Google's Material Design red color
    padding: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default HomeScreen;
