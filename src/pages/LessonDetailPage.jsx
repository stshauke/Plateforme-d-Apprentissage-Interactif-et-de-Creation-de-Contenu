import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Typography, Box, CircularProgress, Alert, Button } from '@mui/material';

const LessonDetailPage = () => {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const docRef = doc(db, 'lessons', lessonId); // 🔁 CORRIGÉ
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLesson(docSnap.data());
        } else {
          setLesson(null);
        }
      } catch (error) {
        console.error('Erreur chargement de la leçon :', error);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Leçon introuvable</Alert>
        <Button component={Link} to={`/courses/${courseId}/lessons`} sx={{ mt: 2 }}>
          Retour aux leçons
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {lesson.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Durée estimée : {lesson.duration} min
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {lesson.content || 'Contenu non disponible'}
      </Typography>
      <Button component={Link} to={`/courses/${courseId}/lessons`} variant="outlined" sx={{ mt: 3 }}>
        Retour aux leçons
      </Button>
    </Box>
  );
};

export default LessonDetailPage;
