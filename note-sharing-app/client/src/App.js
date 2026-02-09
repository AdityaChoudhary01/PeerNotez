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
import ProfilePage from './pages/ProfilePage'; 
import PublicProfilePage from './pages/PublicProfilePage'; 
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

// --- CHAT IMPORTS ---
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import ChatLayout from './components/layout/ChatLayout'; // NEW IMPORT

// Utils
import PrivateRoute from './utils/PrivateRoute';
import AdminRoute from './utils/AdminRoute';

import './App.css'; 

function App() {
  return (
    <AuthProvider>
      {/* Removed PresenceManager (We now manage presence locally in ChatLayout) */}

      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-wrapper">
          <Navbar />
          
          <main 
            className="container main-content" 
            style={{ 
              marginTop: '130px', 
              flex: 1, 
              position: 'relative', 
              zIndex: 1,
              minHeight: '80vh' 
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
              
              {/* Content Viewing */}
              <Route path="/view/:noteId" element={<ViewNotePage />} />
              <Route path="/profile/:userId" element={<PublicProfilePage />} />
              
              {/* Blog System */}
              <Route path="/blogs" element={<BlogPage />} />
              <Route path="/blogs/:slug" element={<BlogPage />} />

              {/* Legal Pages */}
              <Route path="/dmca" element={<DMCAPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              
              {/* --- PROTECTED ROUTES --- */}
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
              <Route path="/feed" element={<PrivateRoute><MyFeedPage /></PrivateRoute>} />
              <Route path="/collections/:collectionId" element={<PrivateRoute><ViewCollectionPage /></PrivateRoute>} />
              
              {/* --- CHAT SYSTEM (Optimization applied) --- */}
              {/* Presence is only active when inside these routes */}
              <Route element={<PrivateRoute><ChatLayout /></PrivateRoute>}>
                  <Route path="/chat" element={<ChatListPage />} />
                  <Route path="/chat/:userId" element={<ChatPage />} />
              </Route>

              {/* Blog Management */}
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
