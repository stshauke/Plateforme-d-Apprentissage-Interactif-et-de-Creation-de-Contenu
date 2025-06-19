import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const CreateLessonForm = ({ courseId, onLessonCreated }) => {
  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    content: '',
    duration: 30,
    isPublished: false,
    order: 0,
    courseId: courseId
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'lessons'), {
        ...lesson,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      onLessonCreated({ id: docRef.id, ...lesson });
    } catch (error) {
      console.error("Error adding lesson: ", error);
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Nouvelle leçon
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Titre"
            fullWidth
            margin="normal"
            required
            value={lesson.title}
            onChange={(e) => setLesson({...lesson, title: e.target.value})}
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={lesson.description}
            onChange={(e) => setLesson({...lesson, description: e.target.value})}
          />
          
          <TextField
            label="Contenu (Markdown)"
            fullWidth
            multiline
            rows={6}
            margin="normal"
            required
            value={lesson.content}
            onChange={(e) => setLesson({...lesson, content: e.target.value})}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Durée (minutes)"
              type="number"
              value={lesson.duration}
              onChange={(e) => setLesson({...lesson, duration: parseInt(e.target.value) || 0})}
              sx={{ width: 150 }}
            />
            
            <TextField
              label="Ordre"
              type="number"
              value={lesson.order}
              onChange={(e) => setLesson({...lesson, order: parseInt(e.target.value) || 0})}
              sx={{ width: 150 }}
            />
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={lesson.isPublished}
                onChange={(e) => setLesson({...lesson, isPublished: e.target.checked})}
              />
            }
            label="Publier immédiatement"
            sx={{ mt: 2 }}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ mt: 3 }}
          >
            Créer la leçon
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateLessonForm;