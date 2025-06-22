
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
  console.log('[CreateQuizPlayer] currentUser:', currentUser?.uid); // Debug auth
  
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
        console.log('[FetchQuizData] Début du chargement pour quizId:', quizId);
        setLoading(true);
        
        // 1. Chargement des métadonnées du quiz
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        console.log('[FetchQuizData] Résultat getDoc(quiz):', quizDoc.exists());
        
        if (!quizDoc.exists()) {
          throw new Error('Quiz non trouvé');
        }
        
        const quizData = { id: quizDoc.id, ...quizDoc.data() };
        setQuiz(quizData);
        console.log('[FetchQuizData] Quiz chargé:', quizData);

        // 2. Chargement des questions
        const questionsQuery = collection(db, 'quizzes', quizId, 'questions');
        const questionsSnapshot = await getDocs(questionsQuery);
        console.log('[FetchQuizData] Nombre de questions trouvées:', questionsSnapshot.size);

        const loadedQuestions = questionsSnapshot.docs.map(d => {
          const qData = d.data();
          console.log(`[Question ${d.id}]`, qData); // Debug chaque question
          
          // Validation des champs requis
          if (!qData.text || qData.correctAnswer === undefined) {
            console.warn(`Question ${d.id} invalide - champs manquants`);
          }
          
          return { id: d.id, ...qData };
        }).filter(q => q.text && q.correctAnswer !== undefined); // Filtre les questions valides

        console.log('[FetchQuizData] Questions validées:', loadedQuestions);
        setQuestions(loadedQuestions);
        
      } catch (err) {
        console.error('[FetchQuizData] Erreur:', err);
        setError(err.message);
      } finally {
        console.log('[FetchQuizData] Chargement terminé');
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    } else {
      setError('ID de quiz manquant');
      setLoading(false);
    }
  }, [quizId]);

  console.log('[Render] État actuel:', {
    loading,
    error,
    quiz,
    questions,
    currentQuestionIndex,
    answers,
    results
  });

  const handleAnswerChange = (questionId, value) => {
    console.log('[AnswerChange] Question:', questionId, 'Réponse:', value);
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateScore = () => {
    console.log('[CalculateScore] Calcul des résultats...');
    let score = 0;
    const calculatedResults = {};

    questions.forEach(question => {
      const userAnswer = answers[question.id];
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

    console.log('[CalculateScore] Résultats:', { score, calculatedResults });
    return { score, calculatedResults };
  };

  const handleSubmit = async () => {
    try {
      console.log('[Submit] Début de la soumission');
      setSubmitting(true);
      const { score, calculatedResults } = calculateScore();

      if (currentUser) {
        console.log('[Submit] Sauvegarde des résultats pour user:', currentUser.uid);
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
      console.log('[Submit] Quiz soumis avec succès');
    } catch (err) {
      console.error('[Submit] Erreur:', err);
      setError("Une erreur est survenue lors de l'envoi du quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const navigateQuestion = (direction) => {
    const newIndex = direction === 'next' ? currentQuestionIndex + 1 : currentQuestionIndex - 1;
    const clampedIndex = Math.max(0, Math.min(newIndex, questions.length - 1));
    console.log('[Navigate] Direction:', direction, 'Nouvel index:', clampedIndex);
    setCurrentQuestionIndex(clampedIndex);
  };

  // Gestion des états de rendu
  if (loading) {
    console.log('[Render] État: Chargement');
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Chargement du quiz...</Typography>
      </Box>
    );
  }

  if (error) {
    console.log('[Render] État: Erreur', error);
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
    console.log('[Render] État: Quiz non disponible');
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Quiz non disponible
      </Alert>
    );
  }

  if (results) {
    console.log('[Render] État: Affichage des résultats');
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
     console.log('[Render] État: Aucune question');
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Ce quiz ne contient aucune question.
        <Button sx={{ ml: 2 }} onClick={onClose}>
          Retour
        </Button>
      </Alert>
    );
  }
  console.log('[Render] État: Affichage du quiz');
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
