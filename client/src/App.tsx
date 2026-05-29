import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import HabitListPage from './pages/HabitListPage';
import CheckinPage from './pages/CheckinPage';
import ProfilePage from './pages/ProfilePage';
import AchievementPage from './pages/AchievementPage';
import ShopPage from './pages/ShopPage';
import LeaderboardPage from './pages/LeaderboardPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><HabitListPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><CheckinPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><AchievementPage /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const ThemeInitializer: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.activeTheme) {
      document.documentElement.setAttribute('data-theme', user.activeTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'default');
    }
  }, [user?.activeTheme]);

  return null;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <ThemeInitializer />
      {isAuthenticated && <Navbar />}
      <div className={isAuthenticated ? 'pt-0 md:pt-16 pb-16 md:pb-0' : ''}>
        <AnimatedRoutes />
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
