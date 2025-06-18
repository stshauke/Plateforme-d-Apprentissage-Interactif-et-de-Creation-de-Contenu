import React from 'react';
import { CreateCourseForm } from '../components/courses';
import { Container, Typography } from '@mui/material';

const CreateCoursePage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Créer un nouveau cours
      </Typography>
      <CreateCourseForm />
    </Container>
  );
};

export default CreateCoursePage;