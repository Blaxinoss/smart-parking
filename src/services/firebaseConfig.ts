// 1. زودنا FirebaseApp و Auth في الـ imports
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, Auth, GoogleAuthProvider } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyAOrPVvR4HPUL950EyTW5uqx13Ixb3D52A",
    authDomain: "garage-36a58.firebaseapp.com",
    projectId: "garage-36a58",
    storageBucket: "garage-36a58.firebasestorage.app",
    messagingSenderId: "828324344311",
    appId: "1:828324344311:web:4373e8ebe181fe38a97ef2",
    measurementId: "G-96C34PCQ8X"
};

// 2. عرفنا المتغيرات بأنواعها الصح عشان الـ TS ميزعلش
let app: FirebaseApp;
let auth: Auth;


export const provider = new GoogleAuthProvider();

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (e) {
    auth = getAuth(app);
}

export { app, auth };