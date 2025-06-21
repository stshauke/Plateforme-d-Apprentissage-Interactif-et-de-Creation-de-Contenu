import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress
} from '@mui/material';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  setDoc 
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';

const CreateQuizPlayer = ({ quizId, onClose }) => {
  const { currentUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les infos du quiz
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizDoc.exists()) {
          throw new Error('Quiz non trouvé');
        }
        setQuiz({ id: quizDoc.id, ...quizDoc.data() });

        // Préparer la requête questions
        let questionsQuery;
        // Si tu as un champ order dans les questions, garde orderBy, sinon retire-le
        try {
          questionsQuery = query(
            collection(db, 'quizzes', quizId, 'questions'),
            orderBy('order', 'asc')
          );
          await getDocs(questionsQuery); // juste pour vérifier l'existence du champ 'order'
        } catch {
          // Si 'order' n'existe pas, on récupère sans orderBy
          questionsQuery = collection(db, 'quizzes', quizId, 'questions');
        }

        // Récupérer les questions
        const questionsSnapshot = await getDocs(questionsQuery);
        
        const loadedQuestions = questionsSnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        
        setQuestions(loadedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Erreur de chargement du quiz:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateScore = () => {
    let score = 0;
    const calculatedResults = {};

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      // Pour éviter erreur type, on convertit en string
      const correctAnswer = question.correctAnswer?.toString() || '';
      const userAnsStr = userAnswer?.toString() || '';

      const isCorrect = userAnsStr === correctAnswer;

      calculatedResults[question.id] = {
        question: question.text,
        userAnswer,
        isCorrect,
        correctAnswer,
        explanation: question.explanation,
        points: question.points || 0
      };

      if (isCorrect) {
        score += question.points || 0;
      }
    });

    return { score, calculatedResults };
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const { score, calculatedResults } = calculateScore();

      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid, 'quizResults', quizId), {
          quizId,
          userId: currentUser.uid,
          score,
          totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
          completedAt: new Date().toISOString(),
          results: calculatedResults
        });
      }

      setResults({
        score,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        details: calculatedResults
      });
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError("Une erreur est survenue lors de l'envoi du quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const navigateQuestion = (direction) => {
    setCurrentQuestionIndex(prev => {
      const newIndex = direction === 'next' ? prev + 1 : prev - 1;
      return Math.max(0, Math.min(newIndex, questions.length - 1));
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Chargement du quiz...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button sx={{ ml: 2 }} onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </Alert>
    );
  }

  if (!quiz) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Quiz non disponible
      </Alert>
    );
  }

  if (results) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Résultats du quiz: {quiz.title}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">
            Score final: {results.score}/{results.totalPoints} points
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(results.score / results.totalPoints) * 100} 
            sx={{ height: 10, mt: 1 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {questions.map((question, idx) => {
          const detail = results.details[question.id] || {};
          return (
            <Box key={question.id} sx={{ 
              mb: 3, 
              p: 2, 
              border: '1px solid', 
              borderColor: detail.isCorrect ? 'success.light' : 'error.light',
              borderRadius: 1,
              backgroundColor: detail.isCorrect ? 'success.50' : 'error.50'
            }}>
              <Typography fontWeight="bold">
                Question {idx + 1}: {question.text} ({question.points || 0} point(s))
              </Typography>

              <Typography sx={{ mt: 1 }}>
                <strong>Votre réponse:</strong> {detail.userAnswer ?? 'Aucune réponse'}
              </Typography>

              {!detail.isCorrect && (
                <Typography sx={{ mt: 1 }}>
                  <strong>Réponse correcte:</strong> {detail.correctAnswer}
                </Typography>
              )}

              {question.explanation && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Explication:</strong> {question.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={onClose}
          >
            Terminer
          </Button>
        </Box>
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Ce quiz ne contient aucune question.
        <Button sx={{ ml: 2 }} onClick={onClose}>
          Retour
        </Button>
      </Alert>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {quiz.title}
      </Typography>

      <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
        {quiz.description}
      </Typography>

      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ height: 8, mb: 2 }}
      />

      <Typography variant="subtitle2" sx={{ mb: 3 }}>
        Question {currentQuestionIndex + 1} sur {questions.length} • {currentQuestion.points || 0} point(s)
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {currentQuestion.text}
        </Typography>

        {currentQuestion.type === 'multiple_choice' && (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {(currentQuestion.options || []).map((option, i) => (
                <FormControlLabel 
                  key={i}
                  value={i.toString()}
                  control={<Radio />}
                  label={option}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {currentQuestion.type === 'true_false' && (
          <FormControl component="fieldset">
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              row
            >
              <FormControlLabel 
                value="true" 
                control={<Radio />} 
                label="Vrai" 
                sx={{ mr: 3 }}
              />
              <FormControlLabel 
                value="false" 
                control={<Radio />} 
                label="Faux" 
              />
            </RadioGroup>
          </FormControl>
        )}

        {currentQuestion.type === 'short_answer' && (
          <TextField
            fullWidth
            variant="outlined"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            sx={{ mt: 1 }}
            placeholder="Entrez votre réponse..."
          />
        )}
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button
          variant="outlined"
          onClick={() => navigateQuestion('prev')}
          disabled={currentQuestionIndex === 0}
        >
          Précédent
        </Button>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => navigateQuestion('next')}
            disabled={!answers[currentQuestion.id]}
          >
            Suivant
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!answers[currentQuestion.id] || submitting}
          >
            {submitting ? 'Envoi en cours...' : 'Soumettre le quiz'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CreateQuizPlayer;
