import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Typography, Box, CircularProgress, Alert, Button, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const LessonDetailPage = () => {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const docRef = doc(db, 'lessons', lessonId); // Accès direct à la collection "lessons"
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
      {/* Titre de la leçon */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {lesson.title}
      </Typography>

      {/* Durée */}
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Durée estimée : {lesson.duration} min
      </Typography>

      {/* Description courte */}
      {lesson.description && (
        <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
          {lesson.description}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Contenu Markdown */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Contenu de la leçon
        </Typography>
        {lesson.content ? (
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        ) : (
          <Typography color="text.secondary">Aucun contenu disponible.</Typography>
        )}
      </Box>

      {/* Bouton retour */}
      <Button component={Link} to={`/courses/${courseId}/lessons`} variant="outlined" sx={{ mt: 4 }}>
        Retour aux leçons
      </Button>
    </Box>
  );
};

export default LessonDetailPage;
