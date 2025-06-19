import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs
} from '@mui/material';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  setDoc 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import LessonItem from '../components/courses/LessonItem';
import CourseProgress from '../components/courses/CourseProgress';
import CreateLessonForm from '../components/courses/CreateLessonForm';

const CourseLessonsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false); // Déplacé à l'intérieur du composant
  const [state, setState] = useState({
    loading: true,
    course: null,
    lessons: [],
    userProgress: {}
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        // 1. Fetch course data
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists()) {
          throw new Error('Course not found');
        }

        // 2. Fetch lessons
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('courseId', '==', courseId),
          orderBy('order', 'asc')
        );
        const lessonsSnapshot = await getDocs(lessonsQuery);

        // 3. Fetch user progress
        let userProgress = {};
        if (currentUser) {
          const progressDoc = await getDoc(
            doc(db, 'users', currentUser.uid, 'progress', courseId)
          );
          userProgress = progressDoc.exists() ? progressDoc.data() : {};
        }

        setState({
          loading: false,
          course: { id: courseDoc.id, ...courseDoc.data() },
          lessons: lessonsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          userProgress
        });

      } catch (error) {
        console.error("Error loading course data:", error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchData();
  }, [courseId, currentUser]);

  const handleMarkCompleted = async (lessonId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const newProgress = {
        ...state.userProgress,
        [lessonId]: { 
          completed: true,
          completedAt: new Date().toISOString() 
        },
        lastUpdated: new Date().toISOString()
      };

      await setDoc(
        doc(db, 'users', currentUser.uid, 'progress', courseId),
        newProgress,
        { merge: true }
      );

      setState(prev => ({
        ...prev,
        userProgress: newProgress
      }));
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/courses')}>
          Retour aux cours
        </Button>
      </Container>
    );
  }

  if (!state.course) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cours introuvable
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/courses')}>
          Retour aux cours
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/courses" style={{ textDecoration: 'none' }}>
          <Button variant="text">Tous les cours</Button>
        </Link>
        <Typography color="text.primary">{state.course.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {state.course.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {state.course.description}
        </Typography>
      </Box>
        {/* ===== PLACEZ LE BLOC DE DÉBOGAGE ICI ===== */}
    {/* DEBUG - À mettre juste avant le bouton Ajouter une leçon */}
    <Box sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="body2">
        Debug Info:<br />
        User ID: {currentUser?.uid || 'Non connecté'}<br />
        Instructor ID: {state.course?.instructorId || 'Non défini'}<br />
        Is Instructor: {(currentUser?.uid === state.course?.instructorId).toString()}
      </Typography>
    </Box>
      {/* Bouton pour créer une nouvelle leçon */}
      {currentUser?.uid === state.course.instructorId && (
  <Button 
    variant="contained" 
    onClick={() => setShowCreateForm(!showCreateForm)}
    sx={{ mb: 3 }}
  >
    {showCreateForm ? 'Annuler' : 'Ajouter une leçon'}
  </Button>
)}

      {/* Formulaire de création */}
      {showCreateForm && (
        <CreateLessonForm 
          courseId={courseId}
          onLessonCreated={(newLesson) => {
            setState(prev => ({
              ...prev,
              lessons: [...prev.lessons, newLesson]
            }));
            setShowCreateForm(false);
          }}
        />
      )}

      <CourseProgress
        courseId={courseId}
        lessons={state.lessons}
        userProgress={state.userProgress}
      />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Liste des leçons
        </Typography>

        {state.lessons.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Aucune leçon disponible pour ce cours
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {state.lessons.map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                index={index}
                isCompleted={state.userProgress[lesson.id]?.completed || false}
                onMarkCompleted={handleMarkCompleted}
              />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CourseLessonsPage;