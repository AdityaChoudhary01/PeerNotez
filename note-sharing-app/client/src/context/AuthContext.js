import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
// Import Firebase functions
import { getAuth, signInWithCustomToken, signOut, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [firebaseLoading, setFirebaseLoading] = useState(true); 
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // Base URL Setup
  const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
  axios.defaults.baseURL = baseURL;

  // --- 1. INITIALIZATION & REFRESH LOGIC ---
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      const storedFbToken = localStorage.getItem("firebaseToken");

      if (storedToken && storedUser) {
        // Restore MongoDB Session
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setIsAuthenticated(true);

        // --- FIREBASE RESTORE ---
        const auth = getAuth();
        if (!auth.currentUser && storedFbToken) {
          try {
            await signInWithCustomToken(auth, storedFbToken);
            console.log("✅ Firebase Session Restored");
          } catch (error) {
            console.error("❌ Failed to restore Firebase session:", error);
            // If token is invalid/expired, we don't logout of MongoDB, 
            // but the user might need to re-login for chat.
          }
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initAuth();
    
    // Listen for Firebase Auth Changes to manage firebaseLoading state
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        setFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. STORAGE UTILITY ---
  const storeAuthData = async (data) => {
    const { token, firebaseToken, ...userData } = data;

    // Save to LocalStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    if (firebaseToken) {
        localStorage.setItem("firebaseToken", firebaseToken);
    }

    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Sign in to Firebase for Chat
    if (firebaseToken) {
        try {
            const auth = getAuth();
            await signInWithCustomToken(auth, firebaseToken);
            console.log("🔥 Firebase: Connected to Chat");
        } catch (error) {
            console.error("❌ Firebase Login Failed:", error.message);
        }
    }
  };

  // --- 3. AUTH API CALLS ---
  const login = async (email, password) => {
    const res = await axios.post("/auth/login", { email, password });
    await storeAuthData(res.data);
  };

  const signup = async (name, email, password) => {
    const res = await axios.post("/auth/register", { name, email, password });
    await storeAuthData(res.data);
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("firebaseToken");
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common["Authorization"];

    try {
        const auth = getAuth();
        await signOut(auth);
        console.log("🔥 Firebase: Disconnected");
    } catch (error) {
        console.error("Error during Firebase signout:", error);
    }
  };

  // --- 4. DATA UTILITIES (Notes & Profile) ---
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };
  
  const saveNote = (noteId) => {
    if (!user) return;
    const updatedUser = { 
        ...user, 
        savedNotes: [...(user.savedNotes || []), noteId] 
    };
    updateUser(updatedUser);
  };

  const unsaveNote = (noteId) => {
    if (!user) return;
    const updatedUser = { 
        ...user, 
        savedNotes: (user.savedNotes || []).filter((id) => id !== noteId) 
    };
    updateUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        firebaseLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUser,
        saveNote,
        unsaveNote,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
