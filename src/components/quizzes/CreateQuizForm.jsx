import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Box, 
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';

const questionTypes = [
  { value: 'multiple_choice', label: 'Choix multiple' },
  { value: 'true_false', label: 'Vrai/Faux' },
  { value: 'short_answer', label: 'Réponse courte' }
];

const CreateQuizForm = ({ lessonId, onQuizCreated }) => {
  const { currentUser } = useAuth();
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple_choice',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    explanation: ''
  });

  const handleAddQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, currentQuestion]
    }));
    setCurrentQuestion({
      type: 'multiple_choice',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      explanation: ''
    });
  };

  const handleRemoveQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSubmit = async () => {
    try {
      // Créer le quiz dans Firestore
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        lessonId,
        title: quiz.title,
        description: quiz.description,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        questionsCount: quiz.questions.length
      });

      // Ajouter les questions
      const questionsRef = collection(db, 'quizzes', quizRef.id, 'questions');
      for (const question of quiz.questions) {
        await addDoc(questionsRef, question);
      }

      onQuizCreated(quizRef.id);
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Créer un nouveau quiz
      </Typography>
      
      <TextField
        fullWidth
        label="Titre du quiz"
        value={quiz.title}
        onChange={(e) => setQuiz({...quiz, title: e.target.value})}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Description"
        multiline
        rows={2}
        value={quiz.description}
        onChange={(e) => setQuiz({...quiz, description: e.target.value})}
        sx={{ mb: 3 }}
      />
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Ajouter une question
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Type de question</InputLabel>
        <Select
          value={currentQuestion.type}
          onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value})}
        >
          {questionTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="Question"
        value={currentQuestion.text}
        onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
        sx={{ mb: 2 }}
      />
      
      {currentQuestion.type === 'multiple_choice' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Options (cochez la réponse correcte):
          </Typography>
          {currentQuestion.options.map((option, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <input
                type="radio"
                name="correctAnswer"
                checked={currentQuestion.correctAnswer === i.toString()}
                onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: i.toString()})}
              />
              <TextField
                fullWidth
                size="small"
                value={option}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                sx={{ ml: 1 }}
              />
            </Box>
          ))}
        </Box>
      )}
      
      {currentQuestion.type === 'true_false' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Sélectionnez la bonne réponse:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={currentQuestion.correctAnswer === 'true' ? 'contained' : 'outlined'}
              onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: 'true'})}
            >
              Vrai
            </Button>
            <Button
              variant={currentQuestion.correctAnswer === 'false' ? 'contained' : 'outlined'}
              onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: 'false'})}
            >
              Faux
            </Button>
          </Box>
        </Box>
      )}
      
      {currentQuestion.type === 'short_answer' && (
        <TextField
          fullWidth
          label="Réponse correcte"
          value={currentQuestion.correctAnswer}
          onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
          sx={{ mb: 2 }}
        />
      )}
      
      <TextField
        fullWidth
        label="Explication (feedback)"
        multiline
        rows={2}
        value={currentQuestion.explanation}
        onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
        sx={{ mb: 2 }}
      />
      
      <TextField
        type="number"
        label="Points"
        value={currentQuestion.points}
        onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 0})}
        sx={{ mb: 2, width: 100 }}
      />
      
      <Button
        variant="contained"
        startIcon={<AddCircleIcon />}
        onClick={handleAddQuestion}
        sx={{ mb: 3 }}
      >
        Ajouter cette question
      </Button>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Questions ajoutées ({quiz.questions.length})
      </Typography>
      
      {quiz.questions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Aucune question ajoutée
        </Typography>
      ) : (
        <Box sx={{ mb: 3 }}>
          {quiz.questions.map((q, i) => (
            <Box key={i} sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px solid #eee', 
              borderRadius: 1,
              position: 'relative'
            }}>
              <Typography fontWeight="bold">
                {i+1}. {q.text} ({q.type === 'multiple_choice' ? 'Choix multiple' : 
                                q.type === 'true_false' ? 'Vrai/Faux' : 'Réponse courte'})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Points: {q.points}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleRemoveQuestion(i)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={quiz.questions.length === 0}
      >
        Créer le quiz
      </Button>
    </Box>
  );
};

export default CreateQuizForm;