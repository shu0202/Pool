import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import TouchableScale from "react-native-touchable-scale";
import { FIREBASE_AUTH, FIREBASE_APP } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, collection, getFirestore } from "firebase/firestore";
import { Image, /* other components */ } from 'react-native';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response.user.uid, email);
      const userId = response.user.uid;
      const db = getFirestore(FIREBASE_APP);
      await setDoc(doc(collection(db, "Users"), userId), {
        email: email,
        investment: 0,
      });
      alert("Account created! Please login.");
      navigation.navigate("Login");
    } catch (error) {
      console.log(error);
      alert("Sign up failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
      {/* Move the Image component here, outside the contentContainer */}
      <Image
        source={require('../../assets/app-icon.png')}
        style={styles.logo}
      />
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Sign Up to Pool!</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {loading ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <TouchableScale
                style={styles.buttonContainer}
                onPress={handleSignUp}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableScale>
            )}

            <TouchableScale onPress={() => navigation.navigate("Login")}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.boldText}>Login</Text>
              </Text>
            </TouchableScale>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Align items to the start
    alignItems: "center",
    backgroundColor: "#022D3B",
    paddingTop: 20, // Keep minimal padding to avoid content touching the edges
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    // Removed justifyContent to avoid pushing content to center vertically
  },
  title: {
    fontSize: 36,
    marginBottom: 30,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  input: {
    width: "90%",
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
    elevation: 6,
  },
  buttonContainer: {
    marginTop: 20,
    width: "90%",
    backgroundColor: "#1BA77C",
    borderRadius: 10,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  switchText: {
    marginTop: 25,
    color: "#FFFFFF",
    fontSize: 16,
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '5%', // Adjust the top margin as needed
    marginBottom: '5%', // Adjust the bottom margin as needed
  },
  container: {
    flex: 1,
    justifyContent: "flex-start", // Align items to the start of the container
    alignItems: "center",
    backgroundColor: "#022D3B",
    paddingTop: 20, // Adjust this to control space at the top
    paddingHorizontal: 20,
  },
  logo: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
    marginTop: 70, // Adjust this to control space at the top around the logo
    marginBottom: 70, // Adjust space between the logo and the contentContainer
  },

  boldText: {
    fontWeight: 'bold',
    // No need to set color or fontSize again unless they are different from switchText
  },
  
});

export default SignUpScreen;