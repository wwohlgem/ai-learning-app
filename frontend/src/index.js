const { useState, useEffect } = React;

// App states
const SCREENS = {
  HOME: "home",
  COURSE_OVERVIEW: "course_overview",
  LESSON: "lesson",
};

// Home Component
function Home({ onCourseCreate }) {
  const [subject, setSubject] = useState("");
  const [numLessons, setNumLessons] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError("Please enter a subject to learn about");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Call the actual backend API
      const response = await fetch("/api/create-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject,
          numLessons: numLessons,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create course");
      }

      if (data.success && data.course_data) {
        onCourseCreate({
          courseData: data.course_data,
          subject: subject,
          numLessons: numLessons,
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(`Failed to create course: ${err.message}`);
      console.error("Course creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 AI Learning App</h1>
        <p>
          Create personalized courses on any subject with AI-powered content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="subject">What subject would you like to learn?</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Python Programming, Digital Marketing, History of Art..."
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>How deep would you like to go?</label>
          <div className="lessons-selector">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`lesson-option ${
                  numLessons === num ? "selected" : ""
                }`}
                onClick={() => !isLoading && setNumLessons(num)}
              >
                <h3>
                  {num} Lesson{num > 1 ? "s" : ""}
                </h3>
                <p>
                  {num === 1 && "Quick overview"}
                  {num === 2 && "Moderate depth"}
                  {num === 3 && "Comprehensive"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="create-btn" disabled={isLoading}>
          {isLoading ? "Creating Your Course..." : "Create My Course"}
        </button>
      </form>

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>
            Our AI agents are researching and creating your personalized
            course...
          </p>
        </div>
      )}
    </div>
  );
}

// Course Overview Component
function CourseOverview({ courseData, subject, onLessonSelect, onBackToHome }) {
  if (!courseData || !courseData.course) return null;

  const lessons = Object.entries(courseData.course);

  return (
    <div className="container">
      <div className="header">
        <h1>📚 {subject}</h1>
        <p>
          {lessons.length} Lesson{lessons.length > 1 ? "s" : ""} Created
        </p>
      </div>

      <div className="course-overview">
        <div className="lessons-grid">
          {lessons.map(([lessonKey, lesson], index) => (
            <div
              key={lessonKey}
              className="lesson-card"
              onClick={() => onLessonSelect(index)}
            >
              <div className="lesson-card-content">
                <h3>Lesson {index + 1}</h3>
                <h4>{lesson.title}</h4>
                <div className="lesson-preview">
                  <p>
                    <strong>Key Concepts:</strong>
                  </p>
                  <div className="concepts-preview">
                    {lesson.key_concepts.slice(0, 3).map((concept, idx) => (
                      <span key={idx} className="concept-tag-small">
                        {concept}
                      </span>
                    ))}
                    {lesson.key_concepts.length > 3 && (
                      <span className="concept-tag-small">
                        +{lesson.key_concepts.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="lesson-card-footer">
                  <span className="start-lesson">Start Lesson →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="course-actions">
          <button className="back-home-btn" onClick={onBackToHome}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Lesson Component
function Lesson({
  lesson,
  lessonIndex,
  totalLessons,
  onNextLesson,
  onPreviousLesson,
  onBackToCourse,
  onBackToHome,
}) {
  if (!lesson) return null;

  return (
    <div className="container">
      <div className="lesson-header">
        <div className="lesson-nav-info">
          <span className="lesson-number">
            Lesson {lessonIndex + 1} of {totalLessons}
          </span>
        </div>
        <h1>{lesson.title}</h1>
      </div>

      <div className="lesson-content-wrapper">
        <div className="lesson-section">
          <div className="key-concepts">
            <h3>🎯 Key Concepts</h3>
            <div className="concepts-list">
              {lesson.key_concepts.map((concept, idx) => (
                <span key={idx} className="concept-tag">
                  {concept}
                </span>
              ))}
            </div>
          </div>

          <div className="key-terms">
            <h3>📚 Key Terms</h3>
            <div className="terms-list">
              {Object.entries(lesson.key_terms).map(([term, definition]) => (
                <div key={term} className="term">
                  <span className="term-name">{term}:</span> {definition}
                </div>
              ))}
            </div>
          </div>

          <div className="lesson-main-content">
            <h3>📖 Lesson Content</h3>
            <div className="lesson-text">{lesson.main_lesson_text}</div>
          </div>
        </div>

        <div className="lesson-navigation">
          <div className="nav-buttons-top">
            <button className="nav-btn secondary" onClick={onBackToCourse}>
              ← Back to Course
            </button>
          </div>

          <div className="lesson-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((lessonIndex + 1) / totalLessons) * 100}%`,
                }}
              ></div>
            </div>
            <p className="progress-text">
              {lessonIndex + 1} of {totalLessons} lessons completed
            </p>
          </div>

          <div className="nav-buttons-bottom">
            <div className="nav-left">
              {lessonIndex > 0 && (
                <button className="nav-btn" onClick={onPreviousLesson}>
                  ← Previous Lesson
                </button>
              )}
            </div>

            <div className="nav-right">
              {lessonIndex < totalLessons - 1 ? (
                <button className="nav-btn primary" onClick={onNextLesson}>
                  Next Lesson →
                </button>
              ) : (
                <button className="nav-btn primary" onClick={onBackToHome}>
                  Complete Course & Back to Home
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
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
