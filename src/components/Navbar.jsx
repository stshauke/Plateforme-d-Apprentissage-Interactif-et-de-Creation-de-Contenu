import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School'; // Icône pour l'étudiant
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

const Navbar = ({ isAuthenticated,userRole, onLoginClick, onLogoutClick }) => {
  const [roleLabel, setRoleLabel] = useState('');

  useEffect(() => {
    console.log('userRole:', userRole);
    if (isAuthenticated && userRole) {
      switch (userRole) {
        case 'admin':
          setRoleLabel('Espace Admin');
          break;
        case 'student':
          setRoleLabel('Espace Étudiant');
          break;
        case 'creator':
          setRoleLabel('Espace Créateur');
          break;
        default:
          setRoleLabel('');
      }
    } else {
      setRoleLabel('');
    }
  }, [isAuthenticated, userRole]);

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Gauche : Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          EduPlay
        </Typography>

        {/* Centre : Espace utilisateur */}
        {roleLabel && (
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          >
            {roleLabel}
          </Typography>
        )}

        {/* Droite : menu + actions */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/courses" sx={{ mx: 1 }}>
            Cours
          </Button>

          {/* Afficher le bouton tableau de bord pour les étudiants */}
          {userRole === 'student' && (
            <IconButton
              color="inherit"
              component={Link}
              to="/student/dashboard"
              sx={{ mx: 1 }}
              aria-label="Tableau de bord étudiant"
            >
              <SchoolIcon />
            </IconButton>
          )}

          {/* Afficher le bouton tableau de bord pour les créateurs */}
          {userRole === 'creator' && (
            <IconButton
              color="inherit"
              component={Link}
              to="/creator/dashboard"
              sx={{ mx: 1 }}
              aria-label="Tableau de bord créateur"
            >
              <DashboardIcon />
            </IconButton>
          )}
          {userRole === 'creator' && (
            <Button color="inherit" component={Link} to="/create-course" sx={{ mx: 1 }}>
              Créer un cours
            </Button>
          )}

          {isAuthenticated ? (
            <Button color="inherit" onClick={onLogoutClick} sx={{ ml: 2 }}>
              Se déconnecter
            </Button>
          ) : (
            <Button color="inherit" onClick={onLoginClick} sx={{ ml: 2 }}>
              Se connecter
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onLoginClick: PropTypes.func.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
};

export default Navbar;