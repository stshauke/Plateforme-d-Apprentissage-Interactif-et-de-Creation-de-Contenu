export const COURSE_IMAGES = {
  php: 'php-course.jpg',
  react: 'react-course.jpg',
  flutter: 'flutter-course.jpg',
  python: 'python-course.jpg'
};

export const getImagePath = (imageKey) => {
  if (!imageKey || !COURSE_IMAGES[imageKey]) {
    return '/images/cours/default-course.jpg';
  }
  return `/images/cours/${COURSE_IMAGES[imageKey]}`;
};