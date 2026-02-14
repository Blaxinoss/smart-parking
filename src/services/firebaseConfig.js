import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
import { getAuth } from "firebase/auth";
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAOrPVvR4HPUL950EyTW5uqx13Ixb3D52A",
    authDomain: "garage-36a58.firebaseapp.com",
    projectId: "garage-36a58",
    storageBucket: "garage-36a58.firebasestorage.app",
    messagingSenderId: "828324344311",
    appId: "1:828324344311:web:4373e8ebe181fe38a97ef2",
    measurementId: "G-96C34PCQ8X"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
