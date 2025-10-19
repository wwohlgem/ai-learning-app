const { useState } = React;

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

window.Home = Home;
