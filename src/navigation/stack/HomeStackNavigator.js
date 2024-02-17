import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SignUpScreen from "../../screens/SignUpScreen";
import HomeScreen from "../../screens/HomeScreen";
import LoginScreen from "../../screens/LoginScreen";
import FriendlyPoolsScreen from "../../screens/FriendlyPoolsScreen"; // Placeholder, replace with actual import
import InvestmentPoolsScreen from "../../screens/InvestmentPoolsScreen"; // Placeholder, replace with actual import
import SettingsPage from "../../screens/SettingsPage";
import SplashScreen from "../../screens/SplashScreen";

import { Ionicons } from "@expo/vector-icons";

import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "../../../firebaseConfig";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function InsideNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Overview"
      screenOptions={({ route }) => ({
        headerShown: false, // Correctly set headerShown as a boolean value
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Friendly Pools") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Overview") {
            iconName = focused ? "water" : "water-outline";
          } else if (route.name === "Investment Pools") {
            iconName = focused ? "wallet" : "wallet-outline";
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#022D3B",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Friendly Pools" component={FriendlyPoolsScreen} />
      <Tab.Screen name="Overview" component={HomeScreen} />
      <Tab.Screen name="Investment Pools" component={InvestmentPoolsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" options={{ headerShown: false }}>
          {() => (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </Stack.Navigator>
          )}
        </Stack.Screen>
        <Stack.Screen name="Inside" component={InsideNavigator} />
        <Stack.Screen name="Settings" component={SettingsPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
