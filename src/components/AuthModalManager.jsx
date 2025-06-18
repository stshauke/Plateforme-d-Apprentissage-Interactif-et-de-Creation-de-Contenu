// src/components/AuthModalsManager.jsx
import { useEffect, useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useAuth } from '../contexts/AuthContext';

const AuthModalsManager = ({ onAuthSuccess }) => {
  const [activeModal, setActiveModal] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleOpenLogin = () => setActiveModal('login');
    const handleOpenRegister = () => setActiveModal('register');

    window.addEventListener('open-login-modal', handleOpenLogin);
    window.addEventListener('open-register-modal', handleOpenRegister);

    return () => {
      window.removeEventListener('open-login-modal', handleOpenLogin);
      window.removeEventListener('open-register-modal', handleOpenRegister);
    };
  }, []);

  const handleClose = () => {
    setActiveModal(null);
    if (currentUser && onAuthSuccess) {
      onAuthSuccess(currentUser.role); // Notifie le parent du rôle après connexion
    }
  };

  return (
    <>
      <LoginModal 
        open={activeModal === 'login'} 
        onClose={handleClose}
      />
      <RegisterModal 
        open={activeModal === 'register'} 
        onClose={handleClose}
        defaultRole="student" // Définit un rôle par défaut pour les nouveaux utilisateurs
      />
    </>
  );
};

AuthModalsManager.propTypes = {
  onAuthSuccess: PropTypes.func
};

export default AuthModalsManager;