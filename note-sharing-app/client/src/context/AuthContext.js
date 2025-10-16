// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // ✅ Use the environment variable properly (single line, no commas/newlines)
  const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

  // ✅ Set axios base URL once (global)
  axios.defaults.baseURL = baseURL;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, [token]);

  // ✅ Store auth data on login/signup success
  const storeAuthData = (data) => {
    const { token, ...userData } = data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // ✅ Auth API calls
  const login = async (email, password) => {
    const res = await axios.post("/auth/login", { email, password });
    storeAuthData(res.data);
  };

  const signup = async (name, email, password) => {
    const res = await axios.post("/auth/register", { name, email, password });
    storeAuthData(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common["Authorization"];
  };

  // ✅ User data utilities
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const saveNote = (noteId) => {
    if (!user) return;
    const updatedUser = { ...user, savedNotes: [...(user.savedNotes || []), noteId] };
    updateUser(updatedUser);
  };

  const unsaveNote = (noteId) => {
    if (!user) return;
    const updatedUser = { ...user, savedNotes: user.savedNotes.filter((id) => id !== noteId) };
    updateUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
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

