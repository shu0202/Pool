import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from '../components/AppHeader'; // Adjust the import path as necessary

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
    <View style={{ flex: 1 }}>
      <Header options={headerOptions} />
      <View style={styles.container}>
        <Text style={styles.text}>Investment Pools</Text>
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
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default InvestmentPools;
