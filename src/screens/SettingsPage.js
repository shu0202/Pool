import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseConfig"; // Adjust the import path as necessary

const SettingsPage = ({ navigation }) => {
  const handleLogOut = () => {
    FIREBASE_AUTH.signOut()
      .then(() => {
        // Handle successful sign out (e.g., navigate to the login screen)
      })
      .catch((error) => {
        // Handle sign out errors here
        console.error("Sign out error:", error);
      });
  };

  const handleGoBack = () => {
    navigation.navigate("Inside"); // Replace "Home" with the name of your home screen component
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity onPress={handleLogOut} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: "#DDDDDD",
  },
  backButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#DD4B39",
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

export default SettingsPage;
