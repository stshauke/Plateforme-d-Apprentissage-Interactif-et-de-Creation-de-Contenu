import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  CircularProgress,
  Tab,
  Tabs,
  Divider,
  Chip
} from '@mui/material';
import LessonItem from './LessonItem';
import CourseProgress from './CourseProgress';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch course
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists()) {
          navigate('/404', { replace: true });
          return;
        }
        setCourse({ id: courseDoc.id, ...courseDoc.data() });
        
        // Fetch lessons
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('courseId', '==', courseId),
          orderBy('order', 'asc')
        );
        const lessonsSnapshot = await getDocs(lessonsQuery);
        setLessons(lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch user progress
        if (currentUser) {
          const progressDoc = await getDoc(doc(db, 'userProgress', currentUser.uid));
          setUserProgress(progressDoc.data() || {});
        }
      } catch (error) {
        console.error("Error loading course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, currentUser, navigate]);

  const handleMarkAsCompleted = async (lessonId) => {
    // Add your completion logic here
    console.log(`Marking lesson ${lessonId} as completed`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box p={4}>
        <Typography variant="h6" component="p">
          Cours non trouvé
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          {course.title}
        </Typography>
        <Box display="flex" gap={1} mb={2}>
          <Chip label={course.category} color="primary" />
          <Chip label={`${lessons.length} leçons`} />
        </Box>
        <Typography variant="body1" paragraph>
          {course.description}
        </Typography>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)} 
        sx={{ mb: 3 }}
      >
        <Tab label="Contenu du cours" />
        <Tab label="À propos" />
        {currentUser && <Tab label="Ma progression" />}
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Leçons
          </Typography>
          <Box mb={4}>
            <CourseProgress 
              courseId={courseId} 
              lessons={lessons} 
              userProgress={userProgress} 
            />
          </Box>
          
          {lessons.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={index}
              isCompleted={userProgress?.lessons?.[lesson.id]?.completed}
              onMarkCompleted={handleMarkAsCompleted}
            />
          ))}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            À propos de ce cours
          </Typography>
          <Typography variant="body1" paragraph>
            {course.longDescription || 'Aucune description détaillée disponible.'}
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" component="h3" gutterBottom>
            Prérequis
          </Typography>
          <Typography variant="body1">
            {course.prerequisites || 'Aucun prérequis nécessaire pour ce cours.'}
          </Typography>
        </Box>
      )}

      {activeTab === 2 && currentUser && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Votre progression
          </Typography>
          {/* Add progress visualization component here */}
        </Box>
      )}
    </Container>
  );
};

export default CourseDetail;