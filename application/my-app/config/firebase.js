// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from '@react-native-firebase/auth';
import {getFirestore} from '@react-native-firebase/firestore';
import { Constant } from 'expo-constants';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbTYneA6uYGdCUp-TcbIQsU15MQ2WnbrI",
  authDomain: "stayble-stay-stable.firebaseapp.com",
  projectId: "stayble-stay-stable",
  storageBucket: "stayble-stay-stable.appspot.com",
  messagingSenderId: "751536067267",
  appId: "1:751536067267:web:24816d08cd640ae4cb4876"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const datanase = getFirestore();