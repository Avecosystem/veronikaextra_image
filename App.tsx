// @ts-nocheck
// App.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { ThemeProvider } from './context/ThemeContext';
import { Head } from '@unhead/react';
import { UnheadProvider, createHead } from '@unhead/react/client';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import ImageGenerator from './components/ImageGenerator';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm'; // Corrected import path
import CreditsPage from './components/CreditsPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import UserProtectedRoute from './components/ProtectedRoute'; // Renamed from ProtectedRoute
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'; // New Admin Protected Route
import AdminDashboardPage from './components/admin/AdminDashboardPage'; // New Admin Dashboard Page
import AdminUsersPage from './components/admin/AdminUsersPage'; // New Admin Users Page
import AdminPaymentsPage from './components/admin/AdminPaymentsPage'; // New Admin Payments Page
import AdminCreditPlansPage from './components/admin/AdminCreditPlansPage'; // New: Admin Credit Plans Page
import AdminContactsPage from './components/admin/AdminContactsPage'; // New: Admin Contacts Page
import ProfilePage from './components/ProfilePage'; // New: Profile Page
import MyPaymentsPage from './components/MyPaymentsPage'; // New: My Payments Page
import CreditHistoryPage from './components/CreditHistoryPage'; // New: Credit History Page
import AdminCreditHistoryPage from './components/admin/AdminCreditHistoryPage'; // New: Admin Credit History Page

// Define props interface for PageTransition
interface PageTransitionProps {
  children: React.ReactNode;
}

// Explicitly type PageTransition as React.FC<PageTransitionProps>
// @ts-ignore
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}

    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full flex-grow" // Ensure it takes full width and grows
  >
    {children}
  </motion.div>
);

// @ts-ignore
const App: React.FC = () => {
  const location = useLocation(); // Use useLocation within the Router context

  // Define SEO metadata for different routes
  const getPageMetadata = () => {
    const metadata: Record<string, { title: string; description: string }> = {
      '/': {
        title: 'VERONIKAextra Images - AI-Powered Image Generation',
        description: 'Generate stunning AI images with VERONIKAextra. Create custom artwork, illustrations, and visual content with our advanced AI image generator.'
      },
      '/generator': {
        title: 'AI Image Generator - VERONIKAextra Images',
        description: 'Create unique AI-generated images with our powerful text-to-image generator. Transform your ideas into stunning visuals instantly.'
      },
      '/credits': {
        title: 'Buy Credits - VERONIKAextra Images',
        description: 'Purchase credits to generate more AI images. Flexible pricing plans to suit your creative needs.'
      },
      '/login': {
        title: 'Login - VERONIKAextra Images',
        description: 'Sign in to your VERONIKAextra account to access your image generation history and manage your credits.'
      },
      '/signup': {
        title: 'Sign Up - VERONIKAextra Images',
        description: 'Create a new VERONIKAextra account to start generating AI images. Get free credits to begin your creative journey.'
      },
      '/profile': {
        title: 'Your Profile - VERONIKAextra Images',
        description: 'Manage your VERONIKAextra account settings, view your image history, and track your credit balance.'
      },
      '/contact': {
        title: 'Contact Us - VERONIKAextra Images',
        description: 'Get in touch with the VERONIKAextra team for support, feedback, or business inquiries.'
      },
      '/privacy': {
        title: 'Privacy Policy - VERONIKAextra Images',
        description: 'Learn how VERONIKAextra protects your privacy and handles your personal data.'
      },
      '/terms': {
        title: 'Terms of Service - VERONIKAextra Images',
        description: 'Read the terms and conditions for using VERONIKAextra image generation services.'
      },
      '/admin/dashboard': {
        title: 'Admin Dashboard - VERONIKAextra Images',
        description: 'Admin panel for managing users, payments, and system settings.'
      }
    };

    return metadata[location.pathname] || {
      title: 'VERONIKAextra Images - AI Image Generation',
      description: 'Generate stunning AI images with VERONIKAextra. Create custom artwork, illustrations, and visual content with our advanced AI image generator.'
    };
  };

  const metadata = getPageMetadata();

  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content="AI, image generation, text to image, AI art, VERONIKAextra, artificial intelligence, creative tools" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://veronikaextra-images.com${location.pathname}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <link rel="canonical" href={`https://veronikaextra-images.com${location.pathname}`} />
      </Head>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen relative z-10 w-full max-w-[100vw] overflow-x-hidden"> {/* Ensure content is above the background cycle */}
          <Navbar />
          <main className="flex-grow flex flex-col w-full max-w-[100vw] overflow-x-hidden px-4 md:px-8">
            <AnimatePresence mode="wait">
              {/* @ts-ignore */}
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                <Route path="/login" element={<PageTransition><LoginForm /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><SignupForm /></PageTransition>} />
                <Route
                  path="/generator"
                  element={
                    <UserProtectedRoute>
                      <PageTransition><ImageGenerator /></PageTransition>
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/credits"
                  element={
                    <UserProtectedRoute>
                      <PageTransition><CreditsPage /></PageTransition>
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <UserProtectedRoute>
                      <PageTransition><ProfilePage /></PageTransition>
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/my-payments"
                  element={
                    <UserProtectedRoute>
                      <PageTransition><MyPaymentsPage /></PageTransition>
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/credit-history"
                  element={
                    <UserProtectedRoute>
                      <PageTransition><CreditHistoryPage /></PageTransition>
                    </UserProtectedRoute>
                  }
                />
                <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
                <Route path="/privacy" element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
                <Route path="/terms" element={<PageTransition><TermsOfServicePage /></PageTransition>} />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <PageTransition><AdminDashboardPage /></PageTransition>
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminProtectedRoute>
                      <PageTransition><AdminUsersPage /></PageTransition>
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <AdminProtectedRoute>
                      <PageTransition><AdminPaymentsPage /></PageTransition>
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/credit-plans"
                  element={
                    <AdminProtectedRoute>
                      <PageTransition><AdminCreditPlansPage /></PageTransition>
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/contacts"
                  element={
                    <AdminProtectedRoute>
                      <PageTransition><AdminContactsPage /></PageTransition>
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/credit-history"
                  element={
                    <AdminProtectedRoute>
                      <PageTransition><AdminCreditHistoryPage /></PageTransition>
                    </AdminProtectedRoute>
                  }
                />
                {/* Fallback for unknown routes */}
                <Route path="*" element={
                  <PageTransition>
                    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] text-center">
                      <h2 className="text-3xl font-bold text-darkText dark:text-lightText">404 - Page Not Found</h2>
                    </div>
                  </PageTransition>
                } />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </>
  );
};

// @ts-ignore
const AppWrapper: React.FC = () => (
  <UnheadProvider head={createHead()}>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </UnheadProvider>
);

export default AppWrapper;
