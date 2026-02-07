import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import ViewNotePage from './pages/ViewNotePage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DonatePage from './pages/DonatePage';
import ProfilePage from './pages/ProfilePage'; // Private "My Profile"
import PublicProfilePage from './pages/PublicProfilePage'; // Public "User Profile"
import AdminDashboardPage from './pages/AdminDashboardPage';
import SupportersPage from './pages/SupportersPage'; 
import BlogPage from './pages/BlogPage';
import PostBlogPage from './pages/PostBlogPage';
import MyBlogsPage from './pages/MyBlogsPage';
import MyFeedPage from './pages/MyFeedPage';
import ViewCollectionPage from './pages/ViewCollectionPage';
import NotFoundPage from './pages/NotFoundPage'; 
import DMCAPolicyPage from './pages/DMCAPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage'; 
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

// Utils
import PrivateRoute from './utils/PrivateRoute';
import AdminRoute from './utils/AdminRoute';

import './App.css'; 

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-wrapper">
          <Navbar />
          
          {/* FIX: Increased marginTop to 130px 
              Navbar (Fixed) occupies ~90px (20px top + 70px height).
              130px ensures clean separation for forms and text on all pages.
          */}
          <main 
            className="container main-content" 
            style={{ 
              marginTop: '130px', 
              flex: 1, 
              position: 'relative', 
              zIndex: 1,
              minHeight: '80vh' // Ensures footer is pushed down on empty pages
            }}
          >
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} /> 
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/supporters" element={<SupportersPage />} />
              
              {/* Content Viewing (Public) */}
              <Route path="/view/:noteId" element={<ViewNotePage />} />
              <Route path="/profile/:userId" element={<PublicProfilePage />} /> {/* New Public Profile Route */}
              
              {/* Blog System (Public) */}
              <Route path="/blogs" element={<BlogPage />} />
              <Route path="/blogs/:slug" element={<BlogPage />} />

              {/* Legal Pages */}
              <Route path="/dmca" element={<DMCAPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              
              {/* --- PROTECTED ROUTES --- */}
              {/* Note: /profile points to the logged-in user's dashboard */}
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
              <Route path="/feed" element={<PrivateRoute><MyFeedPage /></PrivateRoute>} />
              <Route path="/collections/:collectionId" element={<PrivateRoute><ViewCollectionPage /></PrivateRoute>} />
              
              {/* Blog Management (Private) */}
              <Route path="/blogs/post" element={<PrivateRoute><PostBlogPage /></PrivateRoute>} />
              <Route path="/blogs/my-blogs" element={<PrivateRoute><MyBlogsPage /></PrivateRoute>} />

              {/* --- ADMIN ROUTES --- */}
              <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

              {/* --- FALLBACK --- */}
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
