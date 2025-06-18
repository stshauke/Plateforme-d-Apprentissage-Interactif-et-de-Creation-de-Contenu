import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', py: 3 }}>
      <Typography variant="body1">© {new Date().getFullYear()} LearnHub. Tous droits réservés.</Typography>
    </Box>
  );
};

export default Footer;
