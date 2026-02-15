import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { FaSpinner } from 'react-icons/fa';

// Layouts & Utils
import ChatLayout from './components/layout/ChatLayout'; 
import PrivateRoute from './utils/PrivateRoute';
import AdminRoute from './utils/AdminRoute';
import './App.css'; 

// --- CRITICAL PERFORMANCE FIX ---
// Load HomePage directly so the browser doesn't wait for a second round-trip
// to fetch the landing page chunk. This improves LCP significantly.
import HomePage from './pages/HomePage';

// --- PERFORMANCE OPTIMIZED LAZY LOADING ---
// Using a helper to allow manual prefetching of chunks
const lazyWithPreload = (importFn) => {
  const Component = lazy(importFn);
  Component.preload = importFn;
  return Component;
};

// Secondary pages remain lazy loaded to save bandwidth
const LoginPage = lazyWithPreload(() => import('./pages/LoginPage'));
const SignupPage = lazyWithPreload(() => import('./pages/SignupPage'));
const UploadPage = lazyWithPreload(() => import('./pages/UploadPage'));
const ViewNotePage = lazyWithPreload(() => import('./pages/ViewNotePage'));
const SearchPage = lazyWithPreload(() => import('./pages/SearchPage'));
const AboutPage = lazyWithPreload(() => import('./pages/AboutPage'));
const ContactPage = lazyWithPreload(() => import('./pages/ContactPage'));
const DonatePage = lazyWithPreload(() => import('./pages/DonatePage'));
const ProfilePage = lazyWithPreload(() => import('./pages/ProfilePage')); 
const PublicProfilePage = lazyWithPreload(() => import('./pages/PublicProfilePage')); 
const AdminDashboardPage = lazyWithPreload(() => import('./pages/AdminDashboardPage'));
const SupportersPage = lazyWithPreload(() => import('./pages/SupportersPage')); 
const BlogPage = lazyWithPreload(() => import('./pages/BlogPage'));
const PostBlogPage = lazyWithPreload(() => import('./pages/PostBlogPage'));
const MyBlogsPage = lazyWithPreload(() => import('./pages/MyBlogsPage'));
const MyFeedPage = lazyWithPreload(() => import('./pages/MyFeedPage'));
const ViewCollectionPage = lazyWithPreload(() => import('./pages/ViewCollectionPage'));
const NotFoundPage = lazyWithPreload(() => import('./pages/NotFoundPage')); 
const DMCAPolicyPage = lazyWithPreload(() => import('./pages/DMCAPolicyPage'));
const TermsOfServicePage = lazyWithPreload(() => import('./pages/TermsOfServicePage')); 
const PrivacyPolicyPage = lazyWithPreload(() => import('./pages/PrivacyPolicyPage'));
const ChatListPage = lazyWithPreload(() => import('./pages/ChatListPage'));
const ChatPage = lazyWithPreload(() => import('./pages/ChatPage'));

// --- UTILITY COMPONENTS ---

// 1. Loading Spinner (Minimalist to keep Main Thread free)
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '60vh', 
    background: 'transparent'
  }}>
    <FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#00f2fe' }} />
  </div>
);

// 2. ScrollToTop: Performance optimized scroll reset
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Use 'instant' to prevent smooth scroll from blocking thread on mobile
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        
        <div className="app-wrapper">
          <Navbar />
          
          <main 
            className="container main-content" 
            style={{ 
              marginTop: '130px', 
              flex: 1, 
              position: 'relative', 
              zIndex: 1,
              minHeight: '80vh',
              contain: 'content' // CSS Performance optimization
            }}
          >
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* --- PUBLIC ROUTES --- */}
                {/* HomePage is now a standard component, rendering instantly */}
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
                
                {/* --- CHAT SYSTEM --- */}
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
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
