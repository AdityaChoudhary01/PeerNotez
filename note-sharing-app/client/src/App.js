import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
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
import ProfilePage from './pages/ProfilePage'; // --- ADD THIS IMPORT ---
import AdminRoute from './utils/AdminRoute'; // Import AdminRoute
import AdminDashboardPage from './pages/AdminDashboardPage'; // Import AdminDashboardPage
import './App.css';

function App() {
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
              {/* --- ADD THIS ROUTE --- */}
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
