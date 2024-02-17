import React, { useEffect, useState } from "react"; // Combine the import statements for useState and useEffect
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import SignUpScreen from "../../screens/SignUpScreen";
import HomeScreen from "../../screens/HomeScreen";
import LoginScreen from "../../screens/LoginScreen";

import { onAuthStateChanged } from "firebase/auth"; // Removed User as it's not used here
import { FIREBASE_AUTH } from "../../../firebaseConfig";

const Stack = createNativeStackNavigator();

function InsideNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Overview" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const [user, setUser] = useState(null); // Simplified the type to null for demonstration

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      console.log("user", currentUser);
      setUser(currentUser);
    });
    // Cleanup the subscription
    return () => unsubscribe();
  }, []); // Added empty dependency array to ensure effect runs only once on mount

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp">
        {user ? (
          <>
            <Stack.Screen
              name="Inside"
              component={InsideNavigator}
              options={{ title: "Dashboard" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
