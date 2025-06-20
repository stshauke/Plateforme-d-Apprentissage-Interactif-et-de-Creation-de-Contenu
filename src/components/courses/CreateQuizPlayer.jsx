import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel,
  TextField,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';

const QuizPlayer = ({ quizId }) => {
  const { currentUser } = useAuth();
  const [state, setState] = useState({
    loading: true,
    quiz: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    submitted: false,
    score: 0,
    error: null
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Récupérer le quiz
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizDoc.exists()) {
          throw new Error('Quiz non trouvé');
        }

        // Récupérer les questions
        const questionsQuery = query(
          collection(db, 'quizzes', quizId, 'questions'),
          orderBy('createdAt', 'asc')
        );
        const questionsSnapshot = await getDocs(questionsQuery);

        setState({
          ...state,
          loading: false,
          quiz: quizDoc.data(),
          questions: questionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })),
          answers: {}
        });
      } catch (error) {
        setState({
          ...state,
          loading: false,
          error: error.message
        });
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, answer) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      // Calculer le score
      let score = 0;
      const results = {};
      
      state.questions.forEach(question => {
        const userAnswer = state.answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        
        results[question.id] = {
          answer: userAnswer,
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation
        };
        
        if (isCorrect) {
          score += question.points;
        }
      });
      
      // Enregistrer les résultats si l'utilisateur est connecté
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid, 'quizResults', quizId), {
          quizId,
          userId: currentUser.uid,
          score,
          total: state.questions.reduce((sum, q) => sum + q.points, 0),
          completedAt: new Date().toISOString(),
          results
        });
      }
      
      setState(prev => ({
        ...prev,
        submitted: true,
        score,
        results
      }));
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setState(prev => ({
        ...prev,
        error: "Une erreur est survenue lors de l'envoi du quiz"
      }));
    }
  };

  const handleNextQuestion = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
  };

  const handlePrevQuestion = () => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex - 1
    }));
  };

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {state.error}
      </Alert>
    );
  }

  if (state.submitted) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Résultats du quiz
        </Typography>
        <Typography variant="h6" gutterBottom>
          Score: {state.score} / {state.questions.reduce((sum, q) => sum + q.points, 0)}
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          {state.questions.map((question, index) => (
            <Box key={question.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography fontWeight="bold">
                Question {index + 1}: {question.text}
              </Typography>
              
              <Typography sx={{ mt: 1 }}>
                Votre réponse: {state.results[question.id]?.answer || 'Non répondue'}
              </Typography>
              
              <Typography color={state.results[question.id]?.isCorrect ? 'success.main' : 'error.main'}>
                {state.results[question.id]?.isCorrect ? 'Correct' : 'Incorrect'}
              </Typography>
              
              {!state.results[question.id]?.isCorrect && (
                <Typography sx={{ mt: 1 }}>
                  Réponse correcte: {question.correctAnswer}
                </Typography>
              )}
              
              {question.explanation && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Explication:</strong> {question.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (state.questions.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Ce quiz ne contient aucune question.
      </Alert>
    );
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {state.quiz.title}
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        {state.quiz.description}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Question {state.currentQuestionIndex + 1} sur {state.questions.length}
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          {currentQuestion.text}
        </Typography>
        
        {currentQuestion.type === 'multiple_choice' && (
          <FormControl component="fieldset">
            <RadioGroup
              value={state.answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {currentQuestion.options.map((option, i) => (
                <FormControlLabel 
                  key={i}
                  value={i.toString()}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}
        
        {currentQuestion.type === 'true_false' && (
          <FormControl component="fieldset">
            <RadioGroup
              value={state.answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              <FormControlLabel value="true" control={<Radio />} label="Vrai" />
              <FormControlLabel value="false" control={<Radio />} label="Faux" />
            </RadioGroup>
          </FormControl>
        )}
        
        {currentQuestion.type === 'short_answer' && (
          <TextField
            fullWidth
            variant="outlined"
            value={state.answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            sx={{ mt: 1 }}
          />
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handlePrevQuestion}
          disabled={state.currentQuestionIndex === 0}
        >
          Précédent
        </Button>
        
        {state.currentQuestionIndex < state.questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNextQuestion}
          >
            Suivant
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Soumettre le quiz
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuizPlayer;