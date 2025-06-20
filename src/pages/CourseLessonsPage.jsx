import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  setDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import LessonItem from '../components/courses/LessonItem';
import CourseProgress from '../components/courses/CourseProgress';
import CreateLessonForm from '../components/courses/CreateLessonForm';
import QuizForm from '../components/quizzes/CreateQuizForm';
import QuizPlayer from '../components/quizzes/CreateQuizPlayer';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';

const CourseLessonsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState(null);
  const [state, setState] = useState({
    loading: true,
    course: null,
    lessons: [],
    quizzes: [],
    userProgress: {},
    userQuizResults: {},
    error: null
  });

  const isInstructor = currentUser?.uid === state.course?.createdBy;

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

        // 3. Fetch quizzes for all lessons
              const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('courseId', '==', courseId),
          orderBy('createdAt', 'desc') // Ajoutez un ordre pour plus de cohérence
        );
        const quizzesSnapshot = await getDocs(quizzesQuery);

        // 4. Fetch user progress
        let userProgress = {};
        let userQuizResults = {};
        if (currentUser) {
          // Lesson progress
          const progressDoc = await getDoc(
            doc(db, 'users', currentUser.uid, 'progress', courseId)
          );
          userProgress = progressDoc.exists() ? progressDoc.data() : {};

          // Quiz results
          const quizIds = quizzesSnapshot.docs.map(q => q.id);

if (quizIds.length > 0) {
  const resultsQuery = query(
    collection(db, 'users', currentUser.uid, 'quizResults'),
    where('quizId', 'in', quizIds)
  );
  const resultsSnapshot = await getDocs(resultsQuery);
  resultsSnapshot.forEach(doc => {
    userQuizResults[doc.data().quizId] = doc.data();
  });
}

        }

        setState({
          loading: false,
          course: { id: courseDoc.id, ...courseDoc.data() },
          lessons: lessonsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          quizzes: quizzesSnapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          userProgress,
          userQuizResults,
          error: null
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

  const handlePublish = async (lessonId) => {
    try {
      await setDoc(
        doc(db, 'lessons', lessonId),
        { isPublished: true },
        { merge: true }
      );

      setState(prev => ({
        ...prev,
        lessons: prev.lessons.map(l =>
          l.id === lessonId ? { ...l, isPublished: true } : l
        ),
      }));
    } catch (err) {
      console.error('Erreur lors de la publication de la leçon :', err);
    }
  };

  const handleQuizCreated = async (quizId) => {
    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (quizDoc.exists()) {
        setState(prev => ({
          ...prev,
          quizzes: [...prev.quizzes, { id: quizDoc.id, ...quizDoc.data() }]
        }));
      }
      setShowQuizForm(false);
      setSelectedLessonForQuiz(null);
    } catch (error) {
      console.error("Error updating quizzes list:", error);
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

      <CourseProgress
        courseId={courseId}
        lessons={state.lessons}
        quizzes={state.quizzes}
        userProgress={state.userProgress}
        userQuizResults={state.userQuizResults}
      />

      {/* Actions pour les instructeurs */}
      {isInstructor && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Annuler' : 'Ajouter une leçon'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<QuizIcon />}
            onClick={() => {
              setSelectedLessonForQuiz(null);
              setShowQuizForm(true);
            }}
          >
            Créer un quiz pour le cours
          </Button>
        </Box>
      )}

      {/* Formulaire de création de leçon */}
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

      {/* Liste des leçons */}
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
              <Box key={lesson.id}>
                <LessonItem
                  lesson={lesson}
                  index={index}
                  isCompleted={state.userProgress[lesson.id]?.completed || false}
                  onMarkCompleted={handleMarkCompleted}
                  canPublish={isInstructor}
                  onPublish={handlePublish}
                />
                
                {/* Quiz associés à cette leçon */}
                {state.quizzes
                  .filter(q => q.lessonId === lesson.id)
                  .map(quiz => (
                    <Box 
                      key={quiz.id} 
                      sx={{ 
                        ml: 4, 
                        mt: 1, 
                        p: 2, 
                        bgcolor: '#f9f9f9', 
                        borderRadius: 1,
                        borderLeft: '3px solid #3f51b5'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <QuizIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">{quiz.title}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {quiz.description}
                      </Typography>
                      {state.userQuizResults[quiz.id] ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            Score: {state.userQuizResults[quiz.id].score} /{' '}
                            {state.quizzes.find(q => q.id === quiz.id)?.questions?.reduce((sum, q) => sum + q.points, 0) || '?'}
                          </Typography>
                          <Button 
                            size="small" 
                            onClick={() => setSelectedQuiz(quiz.id)}
                          >
                            Voir les résultats
                          </Button>
                        </Box>
                      ) : (
                       <Button
  variant="contained"
  size="small"
  onClick={() => {
    const fullQuiz = state.quizzes.find(q => q.id === quiz.id);
    if (!fullQuiz.questions || fullQuiz.questions.length === 0) {
      alert("Ce quiz n'a aucune question");
      return;
    }
    setSelectedQuiz(fullQuiz.id); // Passez seulement l'ID
  }}
>
  Passer le quiz
</Button>
                      )}
                      {isInstructor && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedLessonForQuiz(lesson.id);
                            setShowQuizForm(true);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                
                {/* Bouton pour ajouter un quiz à cette leçon (instructeur) */}
                {isInstructor && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedLessonForQuiz(lesson.id);
                      setShowQuizForm(true);
                    }}
                    sx={{ ml: 4, mt: 1 }}
                  >
                    Ajouter un quiz
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Formulaire de création de quiz */}
      <Dialog
        open={showQuizForm}
        onClose={() => {
          setShowQuizForm(false);
          setSelectedLessonForQuiz(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedLessonForQuiz 
            ? `Créer un quiz pour la leçon ${state.lessons.find(l => l.id === selectedLessonForQuiz)?.title || ''}`
            : 'Créer un quiz pour le cours'}
        </DialogTitle>
        <DialogContent>
          <QuizForm
            courseId={courseId}
            lessonId={selectedLessonForQuiz}
            onQuizCreated={handleQuizCreated}
          />
        </DialogContent>
      </Dialog>

      {/* Player de quiz */}
      <Dialog
        open={!!selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedQuiz && (
            <QuizPlayer 
              quizId={selectedQuiz} 
              onClose={() => setSelectedQuiz(null)}
              onQuizCompleted={(result) => {
                setState(prev => ({
                  ...prev,
                  userQuizResults: {
                    ...prev.userQuizResults,
                    [result.quizId]: result
                  }
                }));
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CourseLessonsPage;