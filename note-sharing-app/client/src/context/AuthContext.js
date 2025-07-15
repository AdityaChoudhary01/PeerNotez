import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://peernotez.onrender.com/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const storeAuthData = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
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
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser, saveNote, unsaveNote }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
