import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, CircularProgress, Alert, Typography } from '@mui/material';
import {
  CourseDetail,
  CourseProgress,
  LessonItem
} from '../components/courses';
import { db } from '../utils/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch course data
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists()) {
          throw new Error('Course not found');
        }
        setCourse({ id: courseDoc.id, ...courseDoc.data() });

        // 2. Fetch lessons
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

        // 3. Fetch user progress (mock - replace with your actual auth/progress logic)
        const mockUserProgress = {
          courses: {
            [courseId]: { progress: 35 }
          },
          lessons: {
            'lesson1': { completed: true },
            'lesson2': { completed: false }
          }
        };
        setUserProgress(mockUserProgress);

      } catch (err) {
        console.error("Error loading course data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleLessonComplete = (lessonId) => {
    console.log(`Lesson ${lessonId} marked as completed`);
    setUserProgress(prev => ({
      ...prev,
      lessons: {
        ...prev.lessons,
        [lessonId]: { completed: true }
      }
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Course Header and Progress */}
      <CourseDetail course={course} />
      <Box sx={{ my: 4 }}>
        <CourseProgress 
          courseId={courseId}
          lessons={lessons}
          userProgress={userProgress}
        />
      </Box>

      {/* Lessons List */}
      <Box component="section" sx={{ mt: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Leçons du cours
        </Typography>
        
        {lessons.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Aucune leçon disponible pour ce cours
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {lessons.map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                index={index}
                isCompleted={userProgress?.lessons?.[lesson.id]?.completed}
                onMarkCompleted={handleLessonComplete}
              />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CoursePage;
