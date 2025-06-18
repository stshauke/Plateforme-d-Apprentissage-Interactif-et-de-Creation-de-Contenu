import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';

const Navbar = ({ onLoginClick }) => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          EduPlay
        </Typography>

        {/* Navigation principale */}
        <Button 
          color="inherit" 
          component={Link} 
          to="/courses" 
          sx={{ mx: 1 }}
        >
          Cours
        </Button>

        <Button 
          color="inherit" 
          component={Link} 
          to="/create-course"
          sx={{ mx: 1 }}
        >
          Créer un cours
        </Button>

        {/* Bouton de connexion */}
        <Button 
          color="inherit" 
          onClick={onLoginClick}
          sx={{ ml: 2 }}
        >
          Se connecter
        </Button>
      </Toolbar>
    </AppBar>
  );
};

Navbar.propTypes = {
  onLoginClick: PropTypes.func.isRequired,
};

export default Navbar;