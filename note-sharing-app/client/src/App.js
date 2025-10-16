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
import ProfilePage from './pages/ProfilePage';
import AdminRoute from './utils/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SupportersPage from './pages/SupportersPage'; 
import BlogPage from './pages/BlogPage';
import PostBlogPage from './pages/PostBlogPage';
import MyBlogsPage from './pages/MyBlogsPage';
import MyFeedPage from './pages/MyFeedPage';
import ViewCollectionPage from './pages/ViewCollectionPage';

// --- ADDED LEGAL IMPORTS ---
import NotFoundPage from './pages/NotFoundPage'; 
import DMCAPolicyPage from './pages/DMCAPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage'; 
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'; // <-- NEW IMPORT

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

              {/* --- LEGAL ROUTES --- */}
              <Route path="/dmca" element={<DMCAPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} /> {/* <-- NEW ROUTE */}
              
              <Route path="/blogs" element={<BlogPage />} />
              <Route path="/blogs/post" element={<PrivateRoute><PostBlogPage /></PrivateRoute>} />
              <Route path="/blogs/my-blogs" element={<PrivateRoute><MyBlogsPage /></PrivateRoute>} />
              <Route path="/blogs/:slug" element={<BlogPage />} />
              <Route path="/feed" element={<PrivateRoute><MyFeedPage /></PrivateRoute>} />
              <Route 
                path="/collections/:collectionId" 
                element={<PrivateRoute><ViewCollectionPage /></PrivateRoute>} 
              />


              <Route path="/supporters" element={<SupportersPage />} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

              {/* --- 404 NOT FOUND ROUTE --- */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
