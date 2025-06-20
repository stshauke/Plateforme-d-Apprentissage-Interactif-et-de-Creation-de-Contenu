import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress } from '@mui/material';

const CourseProgress = ({ courseId, lessons, userProgress }) => {
  // Compte des leçons publiées seulement
  const publishedLessons = lessons.filter(lesson => lesson.isPublished);

  // Compte des leçons complétées (en utilisant directement userProgress)
  const completedLessonsCount = publishedLessons.filter(
    lesson => userProgress?.[lesson.id]?.completed
  ).length;

  const totalLessons = publishedLessons.length;

  const progressPercentage = totalLessons > 0
    ? Math.round((completedLessonsCount / totalLessons) * 100)
    : 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 1,
          alignItems: 'center'
        }}
      >
        <Typography variant="body1" component="p">
          Progression: {progressPercentage}%
        </Typography>
        <Typography variant="body1" component="p">
          {completedLessonsCount} sur {totalLessons} leçons terminées
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
      isPublished: PropTypes.bool,
      title: PropTypes.string,
      duration: PropTypes.string
    })
  ).isRequired,
  userProgress: PropTypes.object
};

CourseProgress.defaultProps = {
  userProgress: {}
};

export default React.memo(CourseProgress);