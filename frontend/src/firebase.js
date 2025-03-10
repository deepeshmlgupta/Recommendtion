import { initializeApp } from "firebase/app";
import { 
    createUserWithEmailAndPassword, 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { toast } from "react-toastify";

// Firebase Configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyAN3OxPgMan9m8Lhn3W9bNKhLQUXgoSyvo",
//     authDomain: "movie-and-music-bcd56.firebaseapp.com",
//     projectId: "movie-and-music-bcd56",
//     storageBucket: "movie-and-music-bcd56.appspot.com",
//     messagingSenderId: "452852437680",
//     appId: "1:452852437680:web:364011d2b1c5193b436175"
// };
const firebaseConfig = {
    apiKey: "AIzaSyARPx-xI8NpXc_ZKIcyeJtaOXwPFE0coRU",
    authDomain: "movies-and-music-6622d.firebaseapp.com",
    projectId: "movies-and-music-6622d",
    storageBucket: "movies-and-music-6622d.firebasestorage.app",
    messagingSenderId: "134752211588",
    appId: "1:134752211588:web:fe5ba35d93245f194fe8d1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔴 DEBUG: Track authentication state changes
onAuthStateChanged(auth, (user) => {
    console.log("Firebase Auth State Changed:", user);
});

// Sign Up Function
const signup = async (name, email, password) => {
    try {
        console.log("Signing up user:", email);
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        await addDoc(collection(db, "users"), {
            uid: user.uid,
            name,
            authProvider: "local",
            email,
        });

        toast.success("Sign up successful!");
        console.log("User signed up successfully:", user);
    } catch (error) {
        console.error("Signup error:", error);
        toast.error(error.message);
    }
};

// Login Function
const login = async (email, password) => {
    try {
        console.log("Logging in user:", email);
        const res = await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login successful!");
        console.log("User logged in successfully:", res.user);
    } catch (error) {
        console.error("Login error:", error);
        toast.error(error.message);
    }
};

// Logout Function
const logout = async () => {
    try {
        await signOut(auth);
        toast.success("Logged out successfully!");
        console.log("User logged out.");
    } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to log out.");
    }
};

export { auth, db, login, signup, logout };
