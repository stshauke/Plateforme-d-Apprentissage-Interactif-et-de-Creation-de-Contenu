import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { CheckCircle, AccessTime } from '@mui/icons-material';

const CourseCard = ({ course, userProgress }) => {
  const progress = userProgress?.courses?.[course.id]?.progress || 0;
  const isCompleted = progress === 100;
  const [imgError, setImgError] = useState(false);

  // Solution simplifiée et fiable pour les images
  const getImageUrl = () => {
    if (imgError) return '/images/cours/default-course.jpg';
    if (course.thumbnail) return course.thumbnail;
    if (course.imageKey) return `/images/cours/${course.imageKey}-course.jpg`;
    return '/images/cours/default-course.jpg';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={getImageUrl()}
        alt={course.title}
        onError={() => setImgError(true)}
        sx={{
          backgroundColor: '#f5f5f5',
          objectFit: 'cover'
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip label={course.category || 'Général'} size="small" />
          {isCompleted && (
            <Chip
              icon={<CheckCircle fontSize="small" />}
              label="Terminé"
              color="success"
              size="small"
            />
          )}
        </Box>

        <Typography gutterBottom variant="h6" component="h3">
          {course.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.shortDescription || 'Aucune description disponible'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption">
            {course.lessons?.length || 0} leçons
            {course.duration && ` • ${course.duration}h`}
          </Typography>
        </Box>

        {progress > 0 && !isCompleted && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="caption" display="block" gutterBottom>
              Progression: {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </CardContent>

      <Box sx={{ p: 2 }}>
        <Button
          component={Link}
          to={`/courses/${course.id}`}
          variant="contained"
          fullWidth
          color={isCompleted ? 'success' : 'primary'}
        >
          {isCompleted ? 'Revoir le cours' : 'Commencer'}
        </Button>
      </Box>
    </Card>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
    imageKey: PropTypes.string,
    category: PropTypes.string,
    shortDescription: PropTypes.string,
    lessons: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string
      })
    ),
    duration: PropTypes.number
  }).isRequired,
  userProgress: PropTypes.shape({
    courses: PropTypes.objectOf(
      PropTypes.shape({
        progress: PropTypes.number
      })
    )
  })
};

CourseCard.defaultProps = {
  userProgress: null
};

export default CourseCard;