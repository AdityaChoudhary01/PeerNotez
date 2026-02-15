import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { FaSpinner } from 'react-icons/fa';

// --- LAZY LOADED PAGES (Performance Optimization) ---
// This splits the code into smaller chunks, so the initial load is instant.
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const ViewNotePage = lazy(() => import('./pages/ViewNotePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DonatePage = lazy(() => import('./pages/DonatePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage')); 
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage')); 
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const SupportersPage = lazy(() => import('./pages/SupportersPage')); 
const BlogPage = lazy(() => import('./pages/BlogPage'));
const PostBlogPage = lazy(() => import('./pages/PostBlogPage'));
const MyBlogsPage = lazy(() => import('./pages/MyBlogsPage'));
const MyFeedPage = lazy(() => import('./pages/MyFeedPage'));
const ViewCollectionPage = lazy(() => import('./pages/ViewCollectionPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage')); 
const DMCAPolicyPage = lazy(() => import('./pages/DMCAPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage')); 
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const ChatListPage = lazy(() => import('./pages/ChatListPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

// Layouts & Utils (Standard imports for critical routing logic)
import ChatLayout from './components/layout/ChatLayout'; 
import PrivateRoute from './utils/PrivateRoute';
import AdminRoute from './utils/AdminRoute';
import './App.css'; 

// Loading Component for Suspense Fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#00d4ff' }}>
    <FaSpinner className="fa-spin" style={{ fontSize: '2rem' }} aria-hidden="true" />
  </div>
);

function App() {
  return (
    <AuthProvider>
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
            {/* Suspense handles the loading state while the lazy chunk is fetched */}
            <Suspense fallback={<PageLoader />}>
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
