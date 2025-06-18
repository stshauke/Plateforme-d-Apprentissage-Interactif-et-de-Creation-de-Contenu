// src/utils/validation.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateForm = (email, recaptchaValue) => {
  const errors = {};

  if (!email) {
    errors.email = 'L\'email est requis';
  } else if (!validateEmail(email)) {
    errors.email = 'Veuillez entrer un email valide';
  }

  if (!recaptchaValue) {
    errors.recaptcha = 'Veuillez vérifier que vous n\'êtes pas un robot';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegisterForm = (email, password, confirmPassword, recaptchaValue) => {
  const errors = {};
  
  // Validation email
  if (!email) {
    errors.email = 'L\'email est requis';
  } else if (!validateEmail(email)) {
    errors.email = 'Veuillez entrer un email valide';
  }

  // Validation mot de passe
  if (!password) {
    errors.password = 'Le mot de passe est requis';
  } else if (!validatePassword(password)) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
  }

  // Validation confirmation mot de passe
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  // Validation reCAPTCHA
  if (!recaptchaValue) {
    errors.recaptcha = 'Veuillez vérifier que vous n\'êtes pas un robot';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};