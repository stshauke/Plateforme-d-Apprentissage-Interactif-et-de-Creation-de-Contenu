import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CoursePage from './pages/CoursePage';
import CoursesPage from './pages/CoursesPage';
import CourseLessonsPage from './pages/CourseLessonsPage';
import CreateCoursePage from './pages/CreateCoursePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Box, CssBaseline } from '@mui/material';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './utils/firebase';
import LessonDetailPage from './pages/LessonDetailPage';





const App = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleOpenModal = (modalType) => {
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const switchToRegister = () => {
    setActiveModal('register');
  };

  const switchToLogin = () => {
    setActiveModal('login');
  };

  // 🔁 Écoute l'état de connexion Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // 🔓 Fonction de déconnexion
 const handleLogout = async () => {
  try {
    await signOut(auth);
    setIsAuthenticated(false);
    localStorage.removeItem('userRole');
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error.message);
  }
};

  return (
    <Router>
      <AuthProvider>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}
        >
          {/* Header */}
          <Navbar
            isAuthenticated={isAuthenticated}
            onLoginClick={() => handleOpenModal('login')}
            onLogoutClick={handleLogout}
          />

          {/* Main Content */}
          <Box component="main" sx={{ flex: 1, px: 2, py: 3 }}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:courseId" element={<CoursePage />} />
                <Route path="/courses/:courseId/lessons" element={<CourseLessonsPage />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonDetailPage />} />
                <Route
                  path="/create-course"
                  element={
                    <ProtectedRoute>
                      <CreateCoursePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>

          </Box>

          {/* Footer */}
          <Footer />

          {/* Modals */}
          <LoginModal
            open={activeModal === 'login'}
            onClose={handleCloseModal}
            onSwitchToRegister={switchToRegister}
          />

          <RegisterModal
            open={activeModal === 'register'}
            onClose={handleCloseModal}
            onSwitchToLogin={switchToLogin}
          />
        </Box>
      </AuthProvider>
    </Router>
  );
};

export default App;
