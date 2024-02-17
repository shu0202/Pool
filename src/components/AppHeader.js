import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import TouchableScale from "react-native-touchable-scale";
import Ionicons from "@expo/vector-icons/Ionicons"; // If using Expo
// If not using Expo, import Ionicons from 'react-native-vector-icons/Ionicons';

const Header = ({ options }) => {
  return (
    <View style={styles.headerBG}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/app-icon.png")}
          style={styles.logo}
        />
        <TextInput
          placeholder="Search for pools..."
          style={styles.searchInput}
        />
        <View style={styles.buttonContainer}>
          {options.left &&
            options.left.map((button, index) => (
              <TouchableScale
                key={`left-${index}`}
                onPress={button.onPress}
                style={styles.iconButton}
              >
                {/* Render icon if specified or text if not */}
                {button.icon ? (
                  <Ionicons name={button.icon} size={26} color="white" />
                ) : (
                  <Text style={styles.buttonText}>{button.text}</Text>
                )}
              </TouchableScale>
            ))}
          {options.right &&
            options.right.map((button, index) => (
              <TouchableScale
                key={`right-${index}`}
                onPress={button.onPress}
                style={styles.iconButton}
              >
                {/* Render icon if specified or text if not */}
                {button.icon ? (
                  <Ionicons name={button.icon} size={26} color="white" />
                ) : (
                  <Text style={styles.buttonText}>{button.text}</Text>
                )}
              </TouchableScale>
            ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 15, // Added to ensure vertical balance
    height: 70, // Adjusted for potential increased padding
    alignSelf: 'center'
  },
  headerBG: {
    backgroundColor: "#022D3B",
  },
  logo: {
    width: 40, // Slightly reduced to balance with icons
    height: 40,
    marginRight: 8,
    resizeMode: "contain",
  },
  searchInput: {
    flex: 1,
    height: 38, // Slightly reduced to align better with logo and icons
    marginHorizontal: 8, // Adjusted for spacing
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 4, // Adjusted for spacing
    padding: 5, // Added padding for easier touch
  },
  buttonText: {
    fontSize: 16,
    color: "white",
  },
});

export default Header;
