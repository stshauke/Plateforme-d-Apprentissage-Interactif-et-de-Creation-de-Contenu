import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { db, storage } from '../../utils/firebase';
import RichTextEditor from '../editor/RichTextEditor'; // ✅ Import corrigé ici

const EditCourseForm = ({ onUpdateSuccess }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    content: '',
    thumbnail: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse(data);
          setFormData({
            title: data.title,
            category: data.category,
            description: data.description,
            content: data.content,
            thumbnail: data.thumbnail || ''
          });
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Failed to fetch course data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleThumbnailChange = (e) => {
    if (e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
      setFormData(prev => ({
        ...prev,
        thumbnail: URL.createObjectURL(e.target.files[0])
      }));
    }
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile) return formData.thumbnail;

    try {
      setUploading(true);
      const storageRef = ref(storage, `course-thumbnails/${courseId}`);
      await uploadBytes(storageRef, thumbnailFile);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      const thumbnailUrl = await uploadThumbnail();

      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        ...formData,
        thumbnail: thumbnailUrl,
        updatedAt: new Date()
      });

      onUpdateSuccess?.();
      navigate(`/courses/${courseId}`, { state: { updated: true } });
    } catch (err) {
      setError(err.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !course) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Modifier le cours : {course?.title}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Titre du cours"
          name="title"
          fullWidth
          margin="normal"
          value={formData.title}
          onChange={handleInputChange}
          required
        />

        <TextField
          label="Catégorie"
          name="category"
          fullWidth
          margin="normal"
          value={formData.category}
          onChange={handleInputChange}
          required
        />

        <TextField
          label="Description"
          name="description"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
        />

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Image de couverture
          </Typography>
          {formData.thumbnail && (
            <Box mb={2}>
              <img
                src={formData.thumbnail}
                alt="Aperçu de l'image"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '4px'
                }}
              />
            </Box>
          )}
          <input
            accept="image/*"
            id="thumbnail-upload"
            type="file"
            hidden
            onChange={handleThumbnailChange}
          />
          <label htmlFor="thumbnail-upload">
            <Button variant="outlined" component="span">
              {formData.thumbnail ? "Changer l'image" : 'Téléverser une image'}
            </Button>
          </label>
          {uploading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          Contenu du cours
        </Typography>
        <RichTextEditor
          content={formData.content}
          onChange={(content) =>
            setFormData((prev) => ({ ...prev, content }))
          }
        />

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/courses/${courseId}`)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || uploading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Enregistrement...' : 'Sauvegarder'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

EditCourseForm.propTypes = {
  onUpdateSuccess: PropTypes.func
};

export default EditCourseForm;
