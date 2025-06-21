// components/quizzes/EditQuizForm.jsx
import React, { useState } from 'react';
import {
  TextField,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const EditQuizForm = ({ initialQuiz, onSubmit }) => {
  const [quiz, setQuiz] = useState(initialQuiz);

  const handleQuizChange = (field, value) => {
    setQuiz(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSave = async () => {
    try {
      // 🔁 Mettre à jour le quiz principal
      await updateDoc(doc(db, 'quizzes', quiz.id), {
        title: quiz.title,
        description: quiz.description,
        questionsCount: quiz.questions.length,
        updatedAt: new Date().toISOString()
      });

      // 🔁 Réécrire toutes les questions (simple, pas optimal pour gros quiz)
      const questionsRef = doc(db, 'quizzes', quiz.id);
      for (const q of quiz.questions) {
        await setDoc(
          doc(db, 'quizzes', quiz.id, 'questions', q.id || crypto.randomUUID()),
          q
        );
      }

      if (onSubmit) onSubmit(quiz);
      alert('Quiz mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du quiz:', err);
      alert('Erreur lors de la mise à jour du quiz.');
    }
  };

  return (
    <Box>
      <TextField
        label="Titre du quiz"
        fullWidth
        sx={{ mb: 2 }}
        value={quiz.title}
        onChange={(e) => handleQuizChange('title', e.target.value)}
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={2}
        sx={{ mb: 4 }}
        value={quiz.description}
        onChange={(e) => handleQuizChange('description', e.target.value)}
      />

      <Typography variant="h6" gutterBottom>Questions ({quiz.questions.length})</Typography>
      <Divider sx={{ mb: 2 }} />

      {quiz.questions.map((q, index) => (
        <Box
          key={q.id || index}
          sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">Question {index + 1}</Typography>
            <IconButton onClick={() => handleDeleteQuestion(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type de question</InputLabel>
            <Select
              value={q.type}
              label="Type de question"
              onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
            >
              <MenuItem value="multiple_choice">Choix multiple</MenuItem>
              <MenuItem value="true_false">Vrai / Faux</MenuItem>
              <MenuItem value="short_answer">Réponse courte</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Texte de la question"
            value={q.text}
            onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* Options pour choix multiple */}
          {q.type === 'multiple_choice' && (
            <Box sx={{ mt: 2 }}>
              {q.options.map((opt, i) => (
                <TextField
                  key={i}
                  label={`Option ${i + 1}`}
                  fullWidth
                  value={opt}
                  sx={{ mb: 1 }}
                  onChange={(e) => {
                    const newOptions = [...q.options];
                    newOptions[i] = e.target.value;
                    handleQuestionChange(index, 'options', newOptions);
                  }}
                />
              ))}
              <TextField
                fullWidth
                label="Index de la bonne réponse (0-3)"
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
              />
            </Box>
          )}

          {/* Vrai/Faux */}
          {q.type === 'true_false' && (
            <TextField
              fullWidth
              label="Réponse correcte (true/false)"
              value={q.correctAnswer}
              onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
              sx={{ mt: 2 }}
            />
          )}

          {/* Réponse courte */}
          {q.type === 'short_answer' && (
            <TextField
              fullWidth
              label="Réponse attendue"
              value={q.correctAnswer}
              onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
              sx={{ mt: 2 }}
            />
          )}

          <TextField
            fullWidth
            label="Explication"
            multiline
            rows={2}
            value={q.explanation}
            onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            label="Points"
            type="number"
            value={q.points}
            onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value) || 1)}
            sx={{ mt: 2, width: 100 }}
          />
        </Box>
      ))}

      <Button variant="contained" color="primary" onClick={handleSave}>
        Enregistrer les modifications
      </Button>
    </Box>
  );
};

export default EditQuizForm;
