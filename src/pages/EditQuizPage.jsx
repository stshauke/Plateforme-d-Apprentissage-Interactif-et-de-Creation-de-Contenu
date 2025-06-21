// pages/EditQuizPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc, getDoc, collection, getDocs
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import EditQuizForm from '../components/quizzes/EditQuizForm'; // à créer

const EditQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération du quiz + questions
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizDoc.exists()) throw new Error('Quiz introuvable');

        const quizData = { id: quizDoc.id, ...quizDoc.data() };

        const questionsSnapshot = await getDocs(
          collection(db, 'quizzes', quizId, 'questions')
        );

        const questions = questionsSnapshot.docs.map(q => ({
          id: q.id,
          ...q.data()
        }));

        setQuiz({ ...quizData, questions });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSubmit = async (updatedQuiz) => {
    // à implémenter dans le composant enfant via props
    console.log("Mise à jour à enregistrer :", updatedQuiz);
  };

  if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;

  if (error) {
    return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Édition du quiz : {quiz.title}
      </Typography>

      <EditQuizForm initialQuiz={quiz} onSubmit={handleSubmit} />
    </Box>
  );
};

export default EditQuizPage;
