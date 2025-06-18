import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import backgroundImage from '../assets/images/img_home.jpg';
import ThematiqueSection from '../components/ThematiqueSection';


const Home = () => {
  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          px: 2,
        }}
      >
        <Box sx={{ zIndex: 2, maxWidth: 700 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            Apprenez à votre rythme
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Une plateforme interactive pour créer, apprendre et progresser.
          </Typography>
          <Button variant="contained" color="secondary" size="large">
            Commencer maintenant
          </Button>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1,
          }}
        />
      </Box>

      {/* Avantages Section */}
      <Box sx={{ py: 10, backgroundColor: '#f5f5f5', px: { xs: 2, md: 8 } }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Pourquoi choisir LearnHub ?
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }} justifyContent="center">
          {[
            { title: 'Cours Interactifs', desc: 'Apprenez avec des supports modernes et engageants.' },
            { title: 'Création de contenu', desc: 'Publiez vos cours en quelques clics.' },
            { title: 'Suivi intelligent', desc: 'Visualisez vos progrès et statistiques.' },
          ].map((item, index) => ( 
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', boxShadow: 3, textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Section Thématiques séparée */}
      <ThematiqueSection />
    </Box>
  );
};

export default Home;
