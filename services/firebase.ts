import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";



const firebaseConfig = {

  apiKey: "AIzaSyAJdEBhxr3QNZA5lhmnbOoFYjjd0jX9cgA",

  authDomain: "fintrak-pro.firebaseapp.com",

  projectId: "fintrak-pro",

  storageBucket: "fintrak-pro.firebasestorage.app",

  messagingSenderId: "701114247515",

  appId: "1:701114247515:web:3a0503cfed81776d8ad27e"

};



const app = initializeApp(firebaseConfig);



export const db = getFirestore(app);

