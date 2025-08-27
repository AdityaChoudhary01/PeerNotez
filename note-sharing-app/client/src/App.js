import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CustomSplashScreen from './components/layout/CustomSplashScreen';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import ViewNotePage from './pages/ViewNotePage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DonatePage from './pages/DonatePage';
import PrivateRoute from './utils/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import AdminRoute from './utils/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './App.css';

function App() {
  // --- CHANGE: Check if the app is in PWA standalone mode ---
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;

  // Show splash screen only if it's a PWA, otherwise load instantly.
  const [loading, setLoading] = useState(isPWA);

  useEffect(() => {
    // Only run the timer if it's a PWA
    if (isPWA) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000); // 2-second splash screen

      return () => clearTimeout(timer);
    }
  }, [isPWA]); // Effect depends on the PWA status

  if (loading) {
    return <CustomSplashScreen />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/view/:noteId" element={<ViewNotePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/contact" element={<ContactPage />} /> 
              <Route path="/about" element={<AboutPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
