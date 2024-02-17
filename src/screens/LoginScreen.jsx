import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import TouchableScale from "react-native-touchable-scale";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error) {
      console.log(error);
      alert("Sign up failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign In To Pool</Text>
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
          <TouchableScale style={styles.buttonContainer} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableScale>
        )}

        <TouchableScale onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.switchText}>Don't have an account? Sign Up</Text>
        </TouchableScale>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0074D9",
    padding: 20,
  },
  title: {
    fontSize: 26,
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
    borderRadius: 25,
    fontSize: 16,
    color: "#333",
    elevation: 6,
  },
  buttonContainer: {
    marginTop: 20,
    width: "40%",
    backgroundColor: "#2ECC40",
    borderRadius: 25,
    padding: 15,
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
});

export default LoginScreen;
