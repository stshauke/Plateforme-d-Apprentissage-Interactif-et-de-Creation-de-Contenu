import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CoursePage from './pages/CoursePage';
import CoursesPage from './pages/CoursesPage';
import CourseLessonsPage from './pages/CourseLessonsPage';
import CreateCoursePage from './pages/CreateCoursePage';
import LessonDetailPage from './pages/LessonDetailPage';
import EditQuizPage from './pages/EditQuizPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ProtectedRoute from './components/ProtectedRoute';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Box, CssBaseline } from '@mui/material';
import DashboardCreator from './pages/creator/DashboardCreator';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DashboardStudent from './pages/student/DashboardStudent';
import EditCoursePage from './pages/EditCoursePage';

const App = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;
      setIsAuthenticated(true);
      setUserRole(role);
      localStorage.setItem('userRole', role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      localStorage.removeItem('userRole');
    }
  });
  return () => unsubscribe();
}, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      toast.success('Déconnexion réussie !');
      setUserRole('');
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
            userRole={userRole}
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
              <Route path="/quiz/edit/:quizId" element={<EditQuizPage />} />

              {/* Routes protégées */}
              <Route
                path="/create-course"
                element={
                  <ProtectedRoute>
                    <CreateCoursePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Dashboard Créateur */}
              <Route
                path="/creator/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['creator']}>
                    <DashboardCreator />
                  </ProtectedRoute>
                }
              />
              
              {/* Dashboard Admin */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardAdmin />
                  </ProtectedRoute>
                }
              />
           
            <Route
  path="/student/dashboard"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardStudent />
    </ProtectedRoute>
  }
/>
 </Routes>
          </Box>

          {/* Footer */}
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

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