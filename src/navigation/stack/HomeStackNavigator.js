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

import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "../../../firebaseConfig";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function InsideNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Overview"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="FriendlyPools" component={FriendlyPoolsScreen} />
      <Tab.Screen name="Overview" component={HomeScreen} />
      <Tab.Screen name="InvestmentPools" component={InvestmentPoolsScreen} />
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
              options={{ headerShown: true }}
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
