const { useState, useEffect } = React;

// App states
const SCREENS = {
  HOME: "home",
  COURSE_OVERVIEW: "course_overview",
  LESSON: "lesson",
};

// Material Icon component
function MaterialIcon({ icon, className = "", style = {} }) {
  return (
    <span className={`material-icons ${className}`} style={style}>
      {icon}
    </span>
  );
}

// ProgressTracker Component
function ProgressTracker({ isVisible, onComplete }) {
  const [progress, setProgress] = useState({
    stages: [],
    current_stage: null,
    overall_progress: 0,
    timestamp: null,
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isVisible && !socket) {
      // Initialize Socket.IO connection
      const newSocket = io();

      newSocket.on("connect", () => {
        console.log("Connected to progress updates");
      });

      newSocket.on("progress_update", (progressData) => {
        console.log("Progress update received:", progressData);
        setProgress(progressData);

        // Check if all stages are completed
        const allCompleted = progressData.stages.every(
          (stage) => stage.status === "completed"
        );
        if (allCompleted && onComplete) {
          setTimeout(() => {
            onComplete();
          }, 1000); // Small delay to show completion
        }
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from progress updates");
      });

      setSocket(newSocket);
    }

    // Cleanup on unmount or when not visible
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isVisible, socket, onComplete]);

  if (!isVisible) {
    return null;
  }

  const getStageIcon = (status) => {
    switch (status) {
      case "completed":
        return (
          <MaterialIcon icon="check_circle" className="stage-icon-completed" />
        );
      case "running":
        return <MaterialIcon icon="sync" className="stage-icon-running" />;
      case "error":
        return <MaterialIcon icon="error" className="stage-icon-error" />;
      default:
        return <MaterialIcon icon="schedule" className="stage-icon-pending" />;
    }
  };

  const getStageClass = (status) => {
    return `progress-stage ${status}`;
  };

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h2>
          <MaterialIcon icon="psychology" className="header-icon" />
          AI Agents Creating Your Course
        </h2>
        <div className="overall-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.overall_progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {progress.overall_progress}% Complete
          </span>
        </div>
      </div>

      <div className="stages-container">
        {progress.stages.map((stage, index) => (
          <div key={stage.id} className={getStageClass(stage.status)}>
            <div className="stage-header">
              <div className="stage-icon-container">
                {getStageIcon(stage.status)}
              </div>
              <div className="stage-info">
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
                {stage.details && (
                  <div className="stage-details">{stage.details}</div>
                )}
              </div>
              <div className="stage-progress">
                {stage.status === "running" && (
                  <div className="spinner-small"></div>
                )}
              </div>
            </div>

            {stage.status === "running" && (
              <div className="stage-progress-bar">
                <div
                  className="stage-progress-fill"
                  style={{ width: `${stage.progress_percent}%` }}
                ></div>
              </div>
            )}

            {index < progress.stages.length - 1 && (
              <div
                className={`stage-connector ${
                  stage.status === "completed" ? "completed" : ""
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {progress.current_stage && (
        <div className="current-activity">
          <div className="activity-indicator">
            <div className="pulse"></div>
          </div>
          <span>
            Currently working on:{" "}
            {progress.stages.find((s) => s.id === progress.current_stage)
              ?.title || "Processing..."}
          </span>
        </div>
      )}
    </div>
  );
}

// Home Component
function Home({ onCourseCreate }) {
  const [subject, setSubject] = useState("");
  const [numLessons, setNumLessons] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showProgress, setShowProgress] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError("Please enter a subject to learn about");
      return;
    }

    setError("");
    setIsLoading(true);
    setShowProgress(true);

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
        // Don't immediately navigate, let progress tracker handle completion
        // Store the course data for when progress completes
        window.courseCreationResult = {
          courseData: data.course_data,
          subject: subject,
          numLessons: numLessons,
        };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(`Failed to create course: ${err.message}`);
      console.error("Course creation error:", err);
      setShowProgress(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressComplete = () => {
    setShowProgress(false);
    if (window.courseCreationResult) {
      onCourseCreate(window.courseCreationResult);
      window.courseCreationResult = null;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>
          <MaterialIcon icon="rocket_launch" className="header-icon" />
          AI Learning App
        </h1>
        <p>
          Create personalized courses on any subject with AI-powered content
        </p>
      </div>

      <CourseCarousel onCourseSelect={onCourseCreate} />

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

      {isLoading && !showProgress && (
        <div className="loading">
          <div className="spinner"></div>
          <p>
            Our AI agents are researching and creating your personalized
            course...
          </p>
        </div>
      )}

      <ProgressTracker
        isVisible={showProgress}
        onComplete={handleProgressComplete}
      />
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
        <h1>
          <MaterialIcon icon="library_books" className="header-icon" />
          {subject}
        </h1>
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
          <div className="lesson-main-content">
            <h3>
              <MaterialIcon icon="menu_book" className="section-icon" />
              Lesson Content
            </h3>
            <div className="lesson-text">
              {lesson.main_lesson_text.split("\n\n").map((paragraph, index) => (
                <p key={index} style={{ marginBottom: "1rem" }}>
                  {paragraph.split("\n").map((line, lineIndex) => (
                    <span key={lineIndex}>
                      {line}
                      {lineIndex < paragraph.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>

          <div className="key-concepts">
            <h3>
              <MaterialIcon icon="lightbulb" className="section-icon" />
              Key Concepts
            </h3>
            <div className="concepts-list">
              {lesson.key_concepts.map((concept, idx) => (
                <span key={idx} className="concept-tag">
                  {concept}
                </span>
              ))}
            </div>
          </div>

          <div className="key-terms">
            <h3>
              <MaterialIcon icon="book" className="section-icon" />
              Key Terms
            </h3>
            <div className="terms-list">
              {Object.entries(lesson.key_terms).map(([term, definition]) => (
                <div key={term} className="term">
                  <span className="term-name">{term}:</span> {definition}
                </div>
              ))}
            </div>
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

          {lessonIndex === totalLessons - 1 && (
            <div className="assessment-section-inline">
              <p className="assessment-prompt-small">
                You've reached the last lesson. Ready for the assessment?
              </p>
              <button
                className="assessment-btn-small"
                onClick={() => console.log("Assessment clicked")}
              >
                <MaterialIcon icon="quiz" className="btn-icon" />
                Build Assessment
              </button>
            </div>
          )}

          <div className="nav-buttons-bottom">
            {lessonIndex > 0 && (
              <button className="nav-btn" onClick={onPreviousLesson}>
                ← Previous Lesson
              </button>
            )}

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
