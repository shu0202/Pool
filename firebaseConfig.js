// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCF34ewsl85xWiHa-8d7abG3cZ9ISEPIz0",
  authDomain: "pool-bb73e.firebaseapp.com",
  projectId: "pool-bb73e",
  storageBucket: "pool-bb73e.appspot.com",
  messagingSenderId: "558177673028",
  appId: "1:558177673028:web:34df235188ef547b3bc111",
  measurementId: "G-PE30Q2CLHF"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
