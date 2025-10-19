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

window.CourseOverview = CourseOverview;
