import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Dialog, DialogTitle, DialogContent,
  Typography, Button, TextField,
  Divider, Link, IconButton, Box, Grid, Card, CardActionArea,
  CircularProgress, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GoogleIcon from '@mui/icons-material/Google';
import { validateForm } from '../utils/validation';

const LoginModal = ({ open, onClose, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFormErrors({});
    setSubmitError('');
    recaptchaRef.current?.reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const recaptchaValue = recaptchaRef.current?.getValue();
    const { isValid, errors } = validateForm(email, password, recaptchaValue);

    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('userRole', userData.role);

        // Redirection selon le rôle
        switch(userData.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'creator':
            navigate('/creator/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        console.warn("Données utilisateur non trouvées dans Firestore.");
        navigate('/');
      }
      onClose();
    } catch (error) {
      console.error('Erreur Firebase:', error);
      setSubmitError("Échec de l'authentification: " + error.message);
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
          Pour se connecter ou s'inscrire, utilisez les champs ci-dessous
        </Typography>

        <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          {services.map((service) => (
            <Grid item xs={12} sm={4} key={service.id}>
              <Card variant="outlined" sx={{ textAlign: 'center', borderRadius: 2, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                <CardActionArea
                  onClick={() => alert(`Connexion ${service.label}`)}
                  sx={{ p: 2, '&:hover': { backgroundColor: service.bg } }}
                >
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

          <Box sx={{ mb: 2 }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
            />
            {formErrors.recaptcha && (
              <Typography color="error" variant="caption">
                {formErrors.recaptcha}
              </Typography>
            )}
          </Box>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Traitement...' : 'SE CONNECTER'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link href="#" onClick={(e) => e.preventDefault()}>
              Mot de passe oublié ?
            </Link>
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            <Link href="#" onClick={(e) => e.preventDefault()}>
              Conditions générales
            </Link>
          </Typography>

          <Typography variant="body2">
            Pas encore de compte ?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister();
              }}
              sx={{
                cursor: 'pointer',
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Créer un compte
            </Link>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSwitchToRegister: PropTypes.func,
};

export default LoginModal;