import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
} from '@mui/material';

import {
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  DesignServices as DesignServicesIcon,
  Computer as ComputerIcon,
  MenuBook as MenuBookIcon,
  Favorite as FavoriteIcon,
  Calculate as CalculateIcon,
  Science as ScienceIcon,
  Group as GroupIcon,
  DataObject as DataObjectIcon,
  Code as CodeIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon
} from '@mui/icons-material';

const categories = [
  { label: 'Développement personnel', icon: <PsychologyIcon fontSize="large" /> },
  { label: 'Développement professionnel', icon: <SchoolIcon fontSize="large" /> },
  { label: 'Informatique & Programmation', icon: <ComputerIcon fontSize="large" /> },
  { label: 'Data Science & IA', icon: <DataObjectIcon fontSize="large" /> },
  { label: 'Ingénierie & Robotique', icon: <PrecisionManufacturingIcon fontSize="large" /> },
  { label: 'Mathématiques', icon: <CalculateIcon fontSize="large" /> },
  { label: 'Sciences fondamentales', icon: <ScienceIcon fontSize="large" /> },
  { label: 'Sciences humaines & sociales', icon: <GroupIcon fontSize="large" /> },
  { label: 'Santé & Bien-être', icon: <FavoriteIcon fontSize="large" /> },
  { label: 'Éducation & Pédagogie', icon: <MenuBookIcon fontSize="large" /> },
  { label: 'Arts, Design & Création', icon: <DesignServicesIcon fontSize="large" /> },
  { label: 'Code & Développement Web', icon: <CodeIcon fontSize="large" /> },
];


const ThematiqueSection = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: 'white', textAlign: 'center', px: { xs: 2, md: 8 } }}>
      <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
        LES THÉMATIQUES
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        Sélectionnez la catégorie qui vous intéresse et découvrez les formations disponibles.
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 1200, margin: '0 auto' }}>

        {categories.map((cat, idx) => (
          <Grid item xs={6} sm={4} md={2} lg={2} xl={2} key={idx}>

            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 1,
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {cat.icon}
            </Box>
            <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
              {cat.label}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 5, px: 4, py: 1.5, fontWeight: 'bold', textTransform: 'uppercase' }}
      >
        VOIR TOUTES LES CATÉGORIES &nbsp;+
      </Button>
    </Box>
  );
};

export default ThematiqueSection;
