import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import TouchableScale from 'react-native-touchable-scale';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons'; // Make sure to have this installed
import { Image, /* other components */ } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error) {
      console.log(error);
      alert('Sign up failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      {/* Move the Image component here, outside the contentContainer */}
      <Image
        source={require('../../assets/app-icon.png')}
        style={styles.logo}
      />

        <Text style={styles.title}>Sign In To Pool</Text>
        <TextInput
          style={styles.input}
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
        />
        <TextInput
          style={styles.input}
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

            {loading ? (
              <ActivityIndicator size='large' color='#FFFFFF' />
            ) : (
              <TouchableScale style={styles.buttonContainer} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableScale>
            )}

            {/* Social Media Login Section */}
            <Text style={styles.socialLoginText}>Or, login with...</Text>

            <View style={styles.socialIconsContainer}>
  <TouchableScale onPress={() => {}}>
    <View style={styles.iconWrapper}>
      <Ionicons name="logo-google" size={32} color="#FFFFFF" />
    </View>
  </TouchableScale>
  <TouchableScale onPress={() => {}}>
    <View style={styles.iconWrapper}>
      <Ionicons name="logo-facebook" size={32} color="#FFFFFF" />
    </View>
  </TouchableScale>
  <TouchableScale onPress={() => {}}>
    <View style={styles.iconWrapper}>
      <Ionicons name="logo-twitter" size={32} color="#FFFFFF" />
    </View>
  </TouchableScale>
</View>


            <TouchableScale onPress={() => navigation.navigate('SignUp')}>
  <Text style={styles.switchText}>
    Don't have an account? <Text style={styles.boldText}>Sign Up</Text>
  </Text>
</TouchableScale>
          </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  
  contentContainer: {
    width: "100%", // Ensure the container takes the full width
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
    elevation: 6,
  },
  buttonContainer: {
    marginTop: 12,
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

  socialLoginText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40, // Increase this value to create a larger gap
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '80%',
    marginTop: 20, // Optionally, add marginTop here if additional spacing is needed
    marginBottom: 30, // Adjust if you want to change the distance to the next element
  },
  iconWrapper: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 15, // Adjust for more pronounced squoval corners if needed
    padding: 10, // Adjust padding as needed for size
    marginLeft: 10, // Add spacing between icons if needed
    marginRight: 10, // Add spacing between icons if needed
  },

  socialIcon: {
    padding: 10, // Add padding to increase the touchable area
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
  

  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '80%',
    marginBottom: 30, // Increased to lower the icons
  },
  iconWrapper: {
    borderWidth: 1, // Thin border
    borderColor: '#FFFFFF', // White border color
    borderRadius: 10, // Adjust for squoval shape
    padding: 8, // Padding inside the border
  },

  switchText: {
    marginTop: 25,
    color: "#FFFFFF",
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
    color: "#FFFFFF", // Ensure the color matches if needed
    // You can inherit the fontSize from switchText or define it again if necessary
  },



});

export default LoginScreen;