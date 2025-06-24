import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Chip,
  Button
} from '@mui/material';
import {
  Book as CoursesIcon,
  CheckCircle as CompletedIcon,
  Schedule as ProgressIcon,
  Star as FavoriteIcon,
  BarChart as PerformanceIcon,
  EmojiEvents as AchievementsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DashboardStudent = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    courseProgress: 0,
    favoriteCourses: 0,
    performance: 0,
    achievements: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulation de chargement des données
    setTimeout(() => {
      setStats({
        enrolledCourses: 5,
        completedLessons: 12,
        courseProgress: 65,
        favoriteCourses: 3,
        performance: 84,
        achievements: 2
      });
      
      setRecentCourses([
        { id: 1, title: 'React Avancé', progress: 75, lastAccessed: '2023-05-15' },
        { id: 2, title: 'Node.js Fondamentaux', progress: 30, lastAccessed: '2023-05-10' },
        { id: 3, title: 'UI/UX Design', progress: 90, lastAccessed: '2023-05-12' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Mon Tableau de Bord
      </Typography>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard 
          icon={<CoursesIcon fontSize="large" color="primary" />}
          title="Cours Inscrits"
          value={stats.enrolledCourses}
          color="primary"
        />
        <StatCard 
          icon={<CompletedIcon fontSize="large" color="success" />}
          title="Leçons Terminées"
          value={stats.completedLessons}
          color="success"
        />
        <StatCard 
          icon={<ProgressIcon fontSize="large" color="info" />}
          title="Progression Moyenne"
          value={`${stats.courseProgress}%`}
          color="info"
        />
        <StatCard 
          icon={<FavoriteIcon fontSize="large" color="error" />}
          title="Favoris"
          value={stats.favoriteCourses}
          color="error"
        />
        <StatCard 
          icon={<PerformanceIcon fontSize="large" color="warning" />}
          title="Performance"
          value={`${stats.performance}/100`}
          color="warning"
        />
        <StatCard 
          icon={<AchievementsIcon fontSize="large" color="secondary" />}
          title="Badges Obtenus"
          value={stats.achievements}
          color="secondary"
        />
      </Grid>

      {/* Cours récents */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Mes Cours Récents
      </Typography>
      
      <Grid container spacing={3}>
        {recentCourses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.id}>
            <CourseCard 
              course={course}
              onClick={() => navigate(`/courses/${course.id}`)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Actions rapides */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/courses')}
        >
          Explorer les Cours
        </Button>
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={() => navigate('/my-courses')}
        >
          Voir Tous Mes Cours
        </Button>
      </Box>
    </Box>
  );
};

// Composant de carte de statistique réutilisable
const StatCard = ({ icon, title, value, color }) => (
  <Grid item xs={12} sm={6} md={4} lg={2}>
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.contrastText` }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" color="text.secondary">{title}</Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

// Composant de carte de cours réutilisable
const CourseCard = ({ course, onClick }) => (
  <Card 
    sx={{ 
      height: '100%', 
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'scale(1.02)' }
    }}
    onClick={onClick}
  >
    <CardContent>
      <Typography variant="h6" gutterBottom>{course.title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Progression:
        </Typography>
        <Chip 
          label={`${course.progress}%`} 
          size="small" 
          color={course.progress > 70 ? 'success' : course.progress > 30 ? 'warning' : 'error'}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Dernier accès: {course.lastAccessed}
      </Typography>
    </CardContent>
  </Card>
);

export default DashboardStudent;