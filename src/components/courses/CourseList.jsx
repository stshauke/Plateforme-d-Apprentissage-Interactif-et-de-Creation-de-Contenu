import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Grid, Box, Typography, Pagination, CircularProgress, TextField } from '@mui/material';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import CourseCard from './CourseCard';
import { useAuth } from '../../contexts/AuthContext';

const ITEMS_PER_PAGE = 6;

const CourseList = ({ filters = {} }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  // Stabilité des références pour les callbacks
  const stableFilters = JSON.stringify(filters);

  // Fetch courses avec useCallback pour stabilité
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      let q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [stableFilters]); // Dépendance stable

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filtrage optimisé avec useMemo
  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filters.category || course.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, filters.category]);

  // Pagination memoizée
  const { paginatedCourses, pageCount } = React.useMemo(() => {
    const count = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
    const paginated = filteredCourses.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
    return { paginatedCourses: paginated, pageCount: count };
  }, [filteredCourses, page]);

  // Handlers stables
  const handlePageChange = React.useCallback((_, value) => {
    setPage(value);
  }, []);

  const handleSearchChange = React.useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Nos Cours</Typography>
        <TextField
          label="Rechercher un cours"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
      </Box>

      {filteredCourses.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Aucun cours trouvé
        </Typography>
      ) : (
        <>
        
          <Grid container spacing={3} justifyContent="center">
  {paginatedCourses.map(course => (
    <Grid
      item
      xs={12}
      md={6}
      key={course.id}
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        <CourseCard 
          course={course} 
          userProgress={currentUser?.progress} 
        />
      </Box>
    </Grid>
  ))}
</Grid>


          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
            
          )}
          
        </>
        
      )}
      
    </Box>
  );
};

CourseList.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string
  })
};

CourseList.defaultProps = {
  filters: {}
};

export default React.memo(CourseList);