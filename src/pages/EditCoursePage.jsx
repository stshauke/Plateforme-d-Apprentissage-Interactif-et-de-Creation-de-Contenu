import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import EditCourseForm from '../components/courses/EditCourseForm';

const EditCoursePage = () => {
  const navigate = useNavigate();

  const handleUpdateSuccess = () => {
    // Vous pouvez ajouter ici des notifications ou autres actions après une mise à jour réussie
    console.log('Course updated successfully');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Modifier le cours
        </Typography>
      </Box>
      <EditCourseForm 
        onUpdateSuccess={() => {
          handleUpdateSuccess();
          navigate('/courses'); // Redirige vers la liste des cours après modification
        }} 
      />
    </Container>
  );
};

export default EditCoursePage;