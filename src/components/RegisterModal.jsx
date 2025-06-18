import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import ReCAPTCHA from 'react-google-recaptcha';

import {
  Dialog, DialogTitle, DialogContent,
  Typography, Button, TextField,
  Divider, Link, IconButton, Box,
  CircularProgress, Alert, Grid, Card, CardActionArea
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GoogleIcon from '@mui/icons-material/Google';

import { validateRegisterForm } from '../utils/validation';

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  const recaptchaRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFormErrors({});
    setSubmitError('');
    setSubmitSuccess(false);
    recaptchaRef.current?.reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const recaptchaValue = recaptchaRef.current?.getValue();
    const { isValid, errors } = validateRegisterForm(email, password, confirmPassword, recaptchaValue);

    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Utilisateur créé :", userCredential.user);
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      setSubmitError("Erreur d'inscription : " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    {
      id: 'google',
      icon: <GoogleIcon sx={{ fontSize: 40, mb: 1, color: '#DB4437' }} />,
      label: 'Google',
      bg: '#fceae9',
    },
    {
      id: 'facebook',
      icon: <FacebookIcon sx={{ fontSize: 40, mb: 1, color: '#1877f2' }} />,
      label: 'Facebook',
      bg: '#e7f0ff',
    },
    {
      id: 'linkedin',
      icon: <LinkedInIcon sx={{ fontSize: 40, mb: 1, color: '#0a66c2' }} />,
      label: 'LinkedIn',
      bg: '#e8f4fb',
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ p: 2, pb: 0, display: 'flex', justifyContent: 'flex-end' }} disableTypography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pt: 2, pb: 3 }}>
        <Typography variant="h6" align="center" fontWeight="bold" sx={{ mb: 2 }}>
          EduPlay - Apprendre en créant, créer pour apprendre
        </Typography>
        <Typography variant="h5" align="center" fontWeight={600}>
          Bonjour 👋
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
          Créez votre compte pour commencer
        </Typography>

        <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          {services.map((service) => (
            <Grid item xs={12} sm={4} key={service.id}>
              <Card variant="outlined" sx={{ textAlign: 'center', borderRadius: 2, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                <CardActionArea onClick={() => alert(`Inscription ${service.label}`)} sx={{ p: 2, '&:hover': { backgroundColor: service.bg } }}>
                  {service.icon}
                  <Typography variant="body2" fontWeight="bold">{service.label}</Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }}>ou</Divider>

        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            label="Adresse e-mail"
            fullWidth
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
            }}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />

          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
            }}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />

          <TextField
            label="Confirmer le mot de passe"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (formErrors.confirmPassword) setFormErrors(prev => ({ ...prev, confirmPassword: '' }));
            }}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
          />

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
            />
            {formErrors.recaptcha && (
              <Typography color="error" variant="caption" align="center" mt={1}>
                {formErrors.recaptcha}
              </Typography>
            )}
          </Box>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {submitSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Inscription réussie ! Redirection en cours...
            </Alert>
          ) : (
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              endIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Traitement...' : "S'INSCRIRE"}
            </Button>
          )}
        </Box>

        

        <Box sx={{ mt: 3, textAlign: 'center' }}>
  {/* Lien Contactez-nous */}
  <Typography variant="body2" sx={{ mb: 1 }}>
    <Link href="#" onClick={(e) => e.preventDefault()}>
      Contactez-nous
    </Link>
  </Typography>
  
  {/* Lien Conditions générales */}
  <Typography variant="body2" sx={{ mb: 2 }}>
    <Link href="#" onClick={(e) => e.preventDefault()}>
      Conditions générales
    </Link>
  </Typography>

  {/* Lien de connexion */}
  <Typography variant="body2">
    Déjà un compte ?{' '}
    <Link
      component="button"
      variant="body2"
      onClick={(e) => {
        e.preventDefault();
        onSwitchToLogin();
      }}
      sx={{ 
        cursor: 'pointer',
        fontWeight: 'bold',
        '&:hover': {
          textDecoration: 'underline'
        }
      }}
    >
      Se connecter
    </Link>
  </Typography>
</Box>
      </DialogContent>
    </Dialog>
  );
};

// ✅ PropTypes
RegisterModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func, // optionnel
};

export default RegisterModal;
