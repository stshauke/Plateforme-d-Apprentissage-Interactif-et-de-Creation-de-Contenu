import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  School as CoursesIcon,
  MenuBook as LessonsIcon,
  Visibility as ViewsIcon,
  EmojiEvents as SuccessIcon
} from '@mui/icons-material';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';

const DashboardCreator = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    lessons: 0,
    views: 0,
    quizSuccessRate: 0,
    loading: true
  });
  const [topCourses, setTopCourses] = useState([]);

  useEffect(() => {
    const fetchCreatorStats = async () => {
      if (!currentUser?.uid) return;

      try {
        // 1. Compter les cours créés
        const coursesQuery = query(collection(db, 'courses'), 
          where('createdBy', '==', currentUser.uid));
        const coursesSnapshot = await getDocs(coursesQuery);
        const courseIds = coursesSnapshot.docs.map(doc => doc.id);

        // 2. Compter les leçons
const lessonsQuery = courseIds.length > 0 
  ? query(collection(db, 'lessons'), where('courseId', 'in', courseIds.slice(0, 10)))
  : null;
const lessonsSnapshot = lessonsQuery ? await getDocs(lessonsQuery) : { docs: [] };

        // 3. Calculer les vues (suppose un champ 'views' dans les documents)
        let totalViews = 0;
        coursesSnapshot.forEach(doc => {
          totalViews += doc.data().views || 0;
        });

        // 4. Taux de réussite aux quiz
        let quizAttempts = 0;
        let quizSuccesses = 0;
        
        const quizResultsQuery = query(
          collection(db, 'users'), 
          where('quizResults', 'array-contains', { creatorId: currentUser.uid })
        );
        // (Implémentation simplifiée - à adapter selon votre structure)
        
        setStats({
          courses: coursesSnapshot.size,
          lessons: lessonsSnapshot.size,
          views: totalViews,
          quizSuccessRate: quizAttempts > 0 
            ? Math.round((quizSuccesses / quizAttempts) * 100) 
            : 0,
          loading: false
        });

        // 5. Charger les cours les plus populaires
        const coursesData = coursesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 3);
        
        setTopCourses(coursesData);

      } catch (error) {
        console.error("Erreur de chargement:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchCreatorStats();
  }, [currentUser]);

  if (stats.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord Créateur
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Carte: Nombre de cours */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CoursesIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Cours créés</Typography>
                  <Typography variant="h4">{stats.courses}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Nombre de leçons */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LessonsIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Leçons créées</Typography>
                  <Typography variant="h4">{stats.lessons}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Nombre de vues */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ViewsIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Vues totales</Typography>
                  <Typography variant="h4">{stats.views}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Taux de réussite */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SuccessIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">Réussite aux quiz</Typography>
                  <Typography variant="h4">
                    {stats.quizSuccessRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Tableau des cours populaires */}
      <Typography variant="h5" gutterBottom>
        Vos cours les plus populaires
      </Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell align="right">Vues</TableCell>
              <TableCell align="right">Leçons</TableCell>
              <TableCell align="right">Quiz</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.title}</TableCell>
                <TableCell align="right">{course.views || 0}</TableCell>
                <TableCell align="right">
                  {/* À remplacer par le vrai nombre de leçons */}
                  {course.lessonCount || 'N/A'}
                </TableCell>
                <TableCell align="right">
                  {/* À remplacer par le vrai nombre de quiz */}
                  {course.quizCount || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DashboardCreator;