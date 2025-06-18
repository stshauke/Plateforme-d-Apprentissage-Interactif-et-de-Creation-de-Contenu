import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, afficher la page protégée
  return children;
};

export default ProtectedRoute;
