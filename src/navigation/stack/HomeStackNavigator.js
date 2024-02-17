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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      console.log("user", currentUser);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {user ? (
          <>
            {/* InsideNavigator now acts as the main entry point for authenticated users */}
            <Stack.Screen
              name="Inside"
              component={InsideNavigator}
              options={{ headerShown: false }}
            />
            {/* SettingsPage is part of the stack but not in the tabs */}
            <Stack.Screen
              name="Settings"
              component={SettingsPage}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
