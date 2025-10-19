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
            <div className="lesson-text">
              {(() => {
                // Split by double newlines first, then handle single newlines within paragraphs
                const paragraphs = lesson.main_lesson_text.split("\n\n");

                // If we only get one paragraph, try splitting by single newlines and group them intelligently
                if (paragraphs.length === 1) {
                  const lines = lesson.main_lesson_text.split("\n");
                  const smartParagraphs = [];
                  let currentParagraph = [];

                  lines.forEach((line, index) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine === "") {
                      // Empty line - end current paragraph if it has content
                      if (currentParagraph.length > 0) {
                        smartParagraphs.push(currentParagraph.join(" "));
                        currentParagraph = [];
                      }
                    } else {
                      currentParagraph.push(trimmedLine);
                    }
                  });

                  // Add any remaining content as the last paragraph
                  if (currentParagraph.length > 0) {
                    smartParagraphs.push(currentParagraph.join(" "));
                  }

                  return smartParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ));
                }

                // Handle normally split paragraphs
                return paragraphs.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph.split("\n").map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        {lineIndex < paragraph.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="lesson-sidebar">
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
        </div>
      </div>

      <div className="lesson-navigation-bottom">
        <div className="nav-buttons-container">
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
  );
}

window.Lesson = Lesson;
