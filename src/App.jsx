import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CoursePage from './pages/CoursePage';
import CoursesPage from './pages/CoursesPage';
import CourseLessonsPage from './pages/CourseLessonsPage'; // Importez le nouveau composant
import CreateCoursePage from './pages/CreateCoursePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Box, CssBaseline } from '@mui/material';

const App = () => {
  const [activeModal, setActiveModal] = useState(null);

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
          <Navbar onLoginClick={() => handleOpenModal('login')} />

          {/* Main Content */}
          <Box component="main" sx={{ flex: 1, px: 2, py: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CoursePage />} />
              {/* Ajoutez cette nouvelle route */}
              <Route path="/courses/:courseId/lessons" element={<CourseLessonsPage />} />
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