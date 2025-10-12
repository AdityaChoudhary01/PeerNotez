// note-sharing-app/client/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  // FIX 1: Add isAuthenticated state, initialize based on token presence
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token')); 

  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://peernotez.onrender.com/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true); // FIX 2: Set to true on successful load
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, [token]);

  // The functions MUST be defined here, inside the AuthProvider component

  const storeAuthData = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true); // FIX 3: Set to true on login/signup success
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    storeAuthData(res.data);
  };

  const signup = async (name, email, password) => {
    const res = await axios.post('/auth/register', { name, email, password });
    storeAuthData(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false); // FIX 4: Set to false on logout
    delete axios.defaults.headers.common['Authorization'];
  };
  
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };
  
  const saveNote = (noteId) => {
    if (!user) return;
    const updatedUser = { ...user, savedNotes: [...user.savedNotes, noteId] };
    updateUser(updatedUser);
  };

  const unsaveNote = (noteId) => {
    if (!user) return;
    const updatedUser = { ...user, savedNotes: user.savedNotes.filter(id => id !== noteId) };
    updateUser(updatedUser);
  };

  return (
    // The variables used here MUST be defined above.
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        isAuthenticated, // This is the new, required variable
        login,          // This must be defined above
        signup,         // This must be defined above
        logout,         // This must be defined above
        updateUser,     // This must be defined above
        saveNote,       // This must be defined above
        unsaveNote      // This must be defined above
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
