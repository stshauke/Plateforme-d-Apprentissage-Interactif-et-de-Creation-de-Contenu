import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import RichTextEditor from '../editor/RichTextEditor';

const CreateCourseForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: 'programming',
    shortDescription: '',
    description: '',
    content: '<p>Commencez à rédiger votre cours...</p>'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.title || !formData.shortDescription) {
    setError('Le titre et la description courte sont obligatoires');
    return;
  }

  // ✅ Vérifie que l'utilisateur est connecté
  if (!currentUser || !currentUser.uid) {
    setError("Vous devez être connecté pour créer un cours.");
    return;
  }

  try {
    setIsSubmitting(true);

    const newCourse = {
      title: formData.title,
      category: formData.category,
      shortDescription: formData.shortDescription,
      description: formData.description,
      content: formData.content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: currentUser.uid,
      isPublished: false,
      thumbnail: ''
    };

    console.log('Data to Firestore:', newCourse);
console.log("Utilisateur connecté (CreateCourseForm):", currentUser);

    const docRef = await addDoc(collection(db, 'courses'), newCourse);
    navigate(`/courses`);
  } catch (err) {
    console.error("Erreur lors de la création du cours:", err);
    setError('Une erreur est survenue lors de la création du cours');
  } finally {
    setIsSubmitting(false);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Créer un nouveau cours
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Titre du cours"
          name="title"
          fullWidth
          margin="normal"
          value={formData.title}
          onChange={handleChange}
          required
        />
        
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Catégorie</InputLabel>
          <Select
            name="category"
            value={formData.category}
            label="Catégorie"
            onChange={handleChange}
          >
            <MenuItem value="programming">Programmation</MenuItem>
            <MenuItem value="design">Design</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="language">Langues</MenuItem>
            <MenuItem value="science">Science</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          label="Description courte"
          name="shortDescription"
          fullWidth
          margin="normal"
          value={formData.shortDescription}
          onChange={handleChange}
          required
          multiline
          rows={2}
          helperText="Affichée dans les cartes de cours"
        />
        
        <TextField
          label="Description détaillée"
          name="description"
          fullWidth
          margin="normal"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
        />
        
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Contenu principal du cours
        </Typography>
        <RichTextEditor 
          content={formData.content} 
          onChange={(content) => setFormData(prev => ({ ...prev, content }))} 
        />
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/creator/dashboard')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Publication...' : 'Publier le cours'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateCourseForm;