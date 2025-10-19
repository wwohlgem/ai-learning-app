const { useState, useEffect } = React;

// App states
const SCREENS = {
  HOME: "home",
  COURSE_OVERVIEW: "course_overview",
  LESSON: "lesson",
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [courseData, setCourseData] = useState(null);
  const [subject, setSubject] = useState("");
  const [numLessons, setNumLessons] = useState(1);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Navigation functions
  const handleCourseCreate = ({ courseData, subject, numLessons }) => {
    setCourseData(courseData);
    setSubject(subject);
    setNumLessons(numLessons);
    setCurrentScreen(SCREENS.COURSE_OVERVIEW);
  };

  const handleLessonSelect = (lessonIndex) => {
    setCurrentLessonIndex(lessonIndex);
    setCurrentScreen(SCREENS.LESSON);
  };

  const handleNextLesson = () => {
    const lessons = Object.entries(courseData.course);
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleBackToCourse = () => {
    setCurrentScreen(SCREENS.COURSE_OVERVIEW);
  };

  const handleBackToHome = () => {
    setCurrentScreen(SCREENS.HOME);
    setCourseData(null);
    setSubject("");
    setNumLessons(1);
    setCurrentLessonIndex(0);
  };

  // Get current lesson data
  const getCurrentLesson = () => {
    if (!courseData || !courseData.course) return null;
    const lessons = Object.entries(courseData.course);
    return lessons[currentLessonIndex] ? lessons[currentLessonIndex][1] : null;
  };

  const getTotalLessons = () => {
    if (!courseData || !courseData.course) return 0;
    return Object.entries(courseData.course).length;
  };

  // Render appropriate screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case SCREENS.HOME:
        return <Home onCourseCreate={handleCourseCreate} />;

      case SCREENS.COURSE_OVERVIEW:
        return (
          <CourseOverview
            courseData={courseData}
            subject={subject}
            onLessonSelect={handleLessonSelect}
            onBackToHome={handleBackToHome}
          />
        );

      case SCREENS.LESSON:
        return (
          <Lesson
            lesson={getCurrentLesson()}
            lessonIndex={currentLessonIndex}
            totalLessons={getTotalLessons()}
            onNextLesson={handleNextLesson}
            onPreviousLesson={handlePreviousLesson}
            onBackToCourse={handleBackToCourse}
            onBackToHome={handleBackToHome}
          />
        );

      default:
        return <Home onCourseCreate={handleCourseCreate} />;
    }
  };

  return renderCurrentScreen();
}

// Render the app
ReactDOM.render(<App />, document.getElementById("root"));
