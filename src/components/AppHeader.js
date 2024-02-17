import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";

// Assuming `options` is an object with `left` and `right` properties, each being an array of buttons
const Header = ({ options }) => {
  return (
    <View style={styles.headerContainer}>
      <Image source={require("../../assets/app-icon.png")} style={styles.logo} />
      <TextInput placeholder="Search for pools..." style={styles.searchInput} />
      <View style={styles.buttonContainer}>
        {options.left &&
          options.left.map((button, index) => (
            <TouchableOpacity
              key={`left-${index}`}
              onPress={button.onPress}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{button.text}</Text>
            </TouchableOpacity>
          ))}
        {options.right &&
          options.right.map((button, index) => (
            <TouchableOpacity
              key={`right-${index}`}
              onPress={button.onPress}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{button.text}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 60, // Adjust based on your header height preference
    backgroundColor: "#022D3B", // Or any other color
  },
  logo: {
    width: 50, // Adjust the size based on your logo
    height: 50, // Adjust the size based on your logo
    resizeMode: "contain",
  },
  searchInput: {
    flex: 1,
    height: 40, // Adjust based on your preference
    marginHorizontal: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff", // Background color for the search bar
    borderRadius: 20, // Rounded corners for the search bar
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default Header;
