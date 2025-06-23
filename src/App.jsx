import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CoursePage from './pages/CoursePage';
import CoursesPage from './pages/CoursesPage';
import CourseLessonsPage from './pages/CourseLessonsPage';
import CreateCoursePage from './pages/CreateCoursePage';
import LessonDetailPage from './pages/LessonDetailPage';
import EditQuizPage from './pages/EditQuizPage'; // ✅ à créer si ce n’est pas fait

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './contexts/AuthContext';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './utils/firebase';

import { Box, CssBaseline } from '@mui/material';
import DashboardCreator from './pages/creator/DashboardCreator';
import EditCoursePage from './pages/EditCoursePage';

const App = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Header */}
          <Navbar
            isAuthenticated={isAuthenticated}
            onLoginClick={() => setActiveModal('login')}
            onLogoutClick={handleLogout}
          />

          {/* Main Content */}
          <Box component="main" sx={{ flex: 1, px: 2, py: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CoursesPage />} />
              
              <Route path="/courses/:courseId/lessons" element={<CourseLessonsPage />} />
              <Route path="/courses/:courseId" element={<CoursePage />} />
              <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonDetailPage />} />
              <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
              {/* ✅ Route d'édition de quiz */}
              <Route path="/quiz/edit/:quizId" element={<EditQuizPage />} />

              {/* Route protégée */}
              <Route
                path="/create-course"
                element={
                  <ProtectedRoute>
                    <CreateCoursePage />
                  </ProtectedRoute>
                }
              />
                <Route
  path="/creator/dashboard"
  element={
    <ProtectedRoute allowedRoles={['creator']}>
      <DashboardCreator />
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
            onClose={() => setActiveModal(null)}
            onSwitchToRegister={() => setActiveModal('register')}
          />
          <RegisterModal
            open={activeModal === 'register'}
            onClose={() => setActiveModal(null)}
            onSwitchToLogin={() => setActiveModal('login')}
          />
        </Box>
      </AuthProvider>
    </Router>
  );
};

export default App;
