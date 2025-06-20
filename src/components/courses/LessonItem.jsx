import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { CheckCircle, Lock } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const LessonItem = ({ lesson, index, isCompleted, onMarkCompleted, canPublish, onPublish }) => {
  const isLocked = !lesson.isPublished;

  const renderStatusChip = () => {
    if (isCompleted) {
      return (
        <Chip 
          icon={<CheckCircle fontSize="small" />} 
          label="Terminée" 
          color="success" 
          size="small" 
        />
      );
    }
    if (isLocked) {
      return (
        <Chip 
          icon={<Lock fontSize="small" />} 
          label="Verrouillée" 
          size="small" 
        />
      );
    }
    return null;
  };
console.log('canPublish:', canPublish, 'lesson.isPublished:', lesson.isPublished);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Titre avec badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            {lesson.title}
          </Typography>
          {renderStatusChip()}
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {lesson.description || 'Aucune description disponible'}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption">
            Durée: {lesson.duration || 'Non spécifiée'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isLocked && (
              <Button
                component={Link}
                to={`/courses/${lesson.courseId}/lessons/${lesson.id}`}
                variant="outlined"
                size="small"
              >
                Voir la leçon
              </Button>
            )}

            {!isLocked && !isCompleted && (
              <Button
                variant="contained"
                size="small"
                onClick={() => onMarkCompleted(lesson.id)}
              >
                Marquer comme terminée
              </Button>
            )}

            {canPublish && !lesson.isPublished && (
  <Button
    variant="contained"
    size="small"
    color="warning"
    onClick={() => onPublish(lesson.id)}
  >
    Publier
  </Button>
)}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

LessonItem.propTypes = {
  lesson: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    duration: PropTypes.string,
    isPublished: PropTypes.bool,
    courseId: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  isCompleted: PropTypes.bool,
  onMarkCompleted: PropTypes.func,
  canPublish: PropTypes.bool,
  onPublish: PropTypes.func
};

LessonItem.defaultProps = {
  isCompleted: false,
  onMarkCompleted: () => {},
  canPublish: false,
  onPublish: () => {}
};

export default LessonItem;
