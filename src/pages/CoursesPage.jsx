import React from 'react';
import { Container } from '@mui/material';
import CourseList from '../components/courses/CourseList';

const CoursesPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CourseList />
    </Container>
  );
};

export default CoursesPage;
