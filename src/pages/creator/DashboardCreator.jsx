
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
  TableRow,
  useTheme,
  alpha,
  Button,
  Chip,
  Avatar
} from '@mui/material';
import {
  School as CoursesIcon,
  MenuBook as LessonsIcon,
  Visibility as ViewsIcon,
  EmojiEvents as SuccessIcon,
  AttachMoney as RevenueIcon,
  People as StudentsIcon,
  BarChart as AnalyticsIcon,
  RateReview as ReviewsIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const DashboardCreator = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    courses: 0,
    lessons: 0,
    views: 0,
    quizSuccessRate: 0,
    students: 0,
    revenue: 0,
    avgRating: 0,
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

        // 3. Calculer les vues
        let totalViews = 0;
        coursesSnapshot.forEach(doc => {
          totalViews += doc.data().views || 0;
        });

        // 4. Statistiques supplémentaires (simulées - à adapter)
        const totalStudents = Math.floor(Math.random() * 500) + 100;
        const totalRevenue = (Math.random() * 5000 + 500).toFixed(2);
        const averageRating = (Math.random() * 2 + 3).toFixed(1);

        setStats({
          courses: coursesSnapshot.size,
          lessons: lessonsSnapshot.size,
          views: totalViews,
          quizSuccessRate: 75, // Valeur simulée
          students: totalStudents,
          revenue: totalRevenue,
          avgRating: averageRating,
          loading: false
        });

        // 5. Charger les cours les plus populaires
        const coursesData = coursesSnapshot.docs
          .map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            rating: parseFloat(averageRating) - Math.random(),
            lessonCount: Math.floor(Math.random() * 20) + 5,
            quizCount: Math.floor(Math.random() * 10) + 1
          }))
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Style pour les cartes
  const cardStyle = {
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[8]
    }
  };

  // Style pour les icônes
  const iconStyle = {
    fontSize: 40,
    mr: 2,
    p: 1.5,
    borderRadius: '50%',
    color: 'white'
  };

  // Style pour les boutons d'action
  const actionButtonStyle = {
    mt: 3,
    mb: 2,
    mr: 2,
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: theme.shadows[2],
    '&:hover': {
      boxShadow: theme.shadows[6]
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 600,
        mb: 4,
        color: theme.palette.text.primary
      }}>
        Tableau de bord Créateur
      </Typography>
      
      {/* Boutons d'action rapide */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          sx={actionButtonStyle}
          onClick={() => navigate('/create-course')}
        >
          Nouveau Cours
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<AddIcon />}
          sx={actionButtonStyle}
          onClick={() => navigate('/courses')}
        >
          Nouvelle Leçon
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<AddIcon />}
          sx={actionButtonStyle}
          onClick={() => navigate('/courses')}
        >
          Nouveau Quiz
        </Button>
        <Button 
          variant="outlined" 
          color="info" 
          startIcon={<ViewIcon />}
          sx={actionButtonStyle}
          onClick={() => navigate('/courses')}
        >
          Voir Mes Cours
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Carte: Nombre de cours */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CoursesIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Cours créés</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.courses}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Nombre de leçons */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LessonsIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.secondary.main, 0.2),
                  color: theme.palette.secondary.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Leçons créées</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.lessons}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Nombre de vues */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ViewsIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.info.main, 0.2),
                  color: theme.palette.info.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Vues totales</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.views}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Taux de réussite */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SuccessIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.success.main, 0.2),
                  color: theme.palette.success.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Réussite aux quiz</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.quizSuccessRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Étudiants */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StudentsIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.warning.main, 0.2),
                  color: theme.palette.warning.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Étudiants</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.students}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Revenus */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RevenueIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.error.main, 0.2),
                  color: theme.palette.error.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Revenus (€)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.revenue}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Note moyenne */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReviewsIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.info.main, 0.2),
                  color: theme.palette.info.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Note moyenne</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.avgRating}/5
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte: Performance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={4} sx={cardStyle}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon sx={{
                  ...iconStyle,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main
                }} />
                <Box>
                  <Typography variant="subtitle1" color="textSecondary">Performance</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Math.round(stats.views / Math.max(1, stats.students))} vues/étud.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ 
        my: 3,
        bgcolor: theme.palette.divider,
        height: 2
      }} />

      {/* Tableau des cours populaires amélioré */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600,
          color: theme.palette.text.primary
        }}>
          Vos cours les plus populaires
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          endIcon={<ViewIcon />}
          onClick={() => navigate('/courses')}
        >
          Voir tous les cours
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Table>
          <TableHead sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
          }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Cours</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1rem' }}>Statistiques</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topCourses.map((course) => (
              <TableRow 
                key={course.id}
                hover
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                }}
              >
                <TableCell component="th" scope="row" sx={{ minWidth: 250 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={course.imageUrl} 
                      alt={course.title}
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mr: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }}
                    >
                      <CoursesIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {course.category || 'Non catégorisé'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-around',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={`${course.views || 0} vues`} 
                        size="small"
                        icon={<ViewsIcon fontSize="small" />}
                        sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={`${course.lessonCount} leçons`} 
                        size="small"
                        icon={<LessonsIcon fontSize="small" />}
                        sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={`${course.quizCount} quiz`} 
                        size="small"
                        icon={<QuizIcon fontSize="small" />}
                        sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={`${course.rating?.toFixed(1) || 'N/A'}/5`} 
                        size="small"
                        icon={<ReviewsIcon fontSize="small" />}
                        sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
                      />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ minWidth: 200 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                    onClick={() => navigate(`/courses/${course.id}/edit`, { replace: true })}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ViewIcon />}
                   onClick={() => navigate(`/courses/${course.id}/lessons`, { replace: true })}
                  >
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Section d'actions rapides */}
      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Card elevation={3} sx={{ width: '32%', minWidth: 300, mb: 2 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <CoursesIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Gérer vos cours
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mb: 1, width: '100%' }}
              onClick={() => navigate('/courses')}
            >
              Voir tous les cours
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ width: '100%' }}
              onClick={() => navigate('/create-course')}
            >
              Créer un nouveau cours
            </Button>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ width: '32%', minWidth: 300, mb: 2 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <LessonsIcon color="secondary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Gérer vos leçons
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              sx={{ mb: 1, width: '100%' }}
              onClick={() => navigate('/creator/lessons')}
            >
              Voir toutes les leçons
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              sx={{ width: '100%' }}
              onClick={() => navigate('/courses')}
            >
              Créer une nouvelle leçon
            </Button>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ width: '32%', minWidth: 300, mb: 2 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <QuizIcon color="success" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Gérer vos quiz
            </Typography>
            <Button 
              variant="contained" 
              color="success" 
              sx={{ mb: 1, width: '100%' }}
              onClick={() => navigate('/courses')}
            >
              Voir tous les quiz
            </Button>
            <Button 
              variant="outlined" 
              color="success" 
              sx={{ width: '100%' }}
              onClick={() => navigate('/courses')}
            >
              Créer un nouveau quiz
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardCreator;
