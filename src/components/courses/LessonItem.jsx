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

const LessonItem = ({ lesson, index, isCompleted, onMarkCompleted }) => {
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

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
            Leçon {index + 1}: {lesson.title}
          </Typography>
          
          {renderStatusChip()}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {lesson.description || 'Aucune description disponible'}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" component="p">
            Durée: {lesson.duration || 'Non spécifiée'}
          </Typography>
          
          <Box>
            {!isLocked && (
              <>
                <Button
                  component={Link}
                  to={`/lessons/${lesson.id}`}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Voir la leçon
                </Button>
                
                {!isCompleted && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onMarkCompleted(lesson.id)}
                  >
                    Marquer comme terminée
                  </Button>
                )}
              </>
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
    isPublished: PropTypes.bool
  }).isRequired,
  index: PropTypes.number.isRequired,
  isCompleted: PropTypes.bool,
  onMarkCompleted: PropTypes.func
};

LessonItem.defaultProps = {
  isCompleted: false,
  onMarkCompleted: () => {}
};

export default LessonItem;