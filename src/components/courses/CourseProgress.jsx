import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress } from '@mui/material';

const CourseProgress = ({ courseId, lessons, userProgress }) => {
  // Calcul du nombre de leçons complétées
  const completedLessonsCount = React.useMemo(() => (
    lessons.filter(lesson => userProgress?.lessons?.[lesson.id]?.completed).length
  ), [lessons, userProgress]);

  // Calcul du pourcentage de progression
  const progressPercentage = React.useMemo(() => (
    lessons.length > 0 ? Math.round((completedLessonsCount / lessons.length) * 100) : 0
  ), [completedLessonsCount, lessons.length]);

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 1,
        alignItems: 'center'
      }}>
        <Typography variant="body1" component="p">
          Progression: {progressPercentage}%
        </Typography>
        <Typography variant="body1" component="p">
          {completedLessonsCount} sur {lessons.length} leçons terminées
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={progressPercentage} 
        sx={{ 
          height: 10, 
          borderRadius: 5,
          '& .MuiLinearProgress-bar': {
            borderRadius: 5
          }
        }} 
      />
    </Box>
  );
};

CourseProgress.propTypes = {
  courseId: PropTypes.string.isRequired,
  lessons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      // Ajoutez d'autres propriétés des leçons si nécessaire
      title: PropTypes.string,
      duration: PropTypes.string
    })
  ).isRequired,
  userProgress: PropTypes.shape({
    lessons: PropTypes.objectOf(
      PropTypes.shape({
        completed: PropTypes.bool,
        completedAt: PropTypes.instanceOf(Date),
        // Ajoutez d'autres propriétés de progression si nécessaire
      })
    ),
    courses: PropTypes.objectOf(
      PropTypes.shape({
        progress: PropTypes.number
      })
    )
  })
};

CourseProgress.defaultProps = {
  userProgress: {
    lessons: {},
    courses: {}
  }
};

export default React.memo(CourseProgress);