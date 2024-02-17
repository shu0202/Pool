import React from "react";
import { SafeAreaView, View, Platform, StatusBar } from "react-native";
import AppNavigator from "./src/navigation/stack/HomeStackNavigator";

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Apply SafeAreaView only for iOS devices */}
      {Platform.OS === "ios" && (
        <SafeAreaView style={{ flex: 0, backgroundColor: "#022D3B" }} />
      )}
      {/* For Android, StatusBar is used to ensure content does not overlap the status bar */}
      {Platform.OS === "android" && (
        <StatusBar backgroundColor="transparent" translucent />
      )}
      <AppNavigator />
    </View>
  );
};

export default App;
