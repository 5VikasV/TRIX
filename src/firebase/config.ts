import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBu2SbyHhjYqtvEveMpdptczEs33g_4E4E",
  authDomain: "trix-online.firebaseapp.com",
  projectId: "trix-online",
  storageBucket: "trix-online.firebasestorage.app",
  messagingSenderId: "58239124860",
  appId: "1:58239124860:web:ee2f24123b235f4bfb50f9",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);