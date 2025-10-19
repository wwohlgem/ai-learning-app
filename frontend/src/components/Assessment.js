function Assessment({ assessment, onComplete, onBackToCourse }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState({});
  const [showResults, setShowResults] = React.useState(false);
  const [score, setScore] = React.useState(0);

  if (!assessment || !assessment.questions) {
    return (
      <div className="container">
        <div className="assessment-error">
          <h2>Assessment Not Available</h2>
          <p>
            There was an issue loading the assessment. Please try generating it
            again.
          </p>
          <button className="nav-btn primary" onClick={onBackToCourse}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const totalQuestions = assessment.questions.length;

  const handleAnswerSelect = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate and show results
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    assessment.questions.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      if (question.type === "multiple_choice") {
        if (userAnswer === question.correct_answer) {
          correctCount++;
        }
      } else if (question.type === "true_false") {
        if (userAnswer === question.correct_answer) {
          correctCount++;
        }
      }
    });

    setScore(correctCount);
    setShowResults(true);
  };

  const restartAssessment = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const getScorePercentage = () => {
    return Math.round((score / totalQuestions) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90)
      return "Excellent work! You've mastered this material.";
    if (percentage >= 80) return "Great job! You have a strong understanding.";
    if (percentage >= 70) return "Good work! You understand most concepts.";
    if (percentage >= 60) return "Not bad! Consider reviewing some topics.";
    return "Keep studying! Review the lessons and try again.";
  };

  if (showResults) {
    return (
      <div className="container">
        <div className="assessment-results">
          <div className="results-header">
            <h1>Assessment Complete!</h1>
            <div className="score-circle">
              <div className="score-text">
                <span className="score-number">{score}</span>
                <span className="score-total">/{totalQuestions}</span>
              </div>
              <div className="score-percentage">{getScorePercentage()}%</div>
            </div>
            <p className="score-message">{getScoreMessage()}</p>
          </div>

          <div className="results-details">
            <h3>Question Review</h3>
            {assessment.questions.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect =
                question.type === "multiple_choice"
                  ? userAnswer === question.correct_answer
                  : userAnswer === question.correct_answer;

              return (
                <div
                  key={question.id}
                  className={`question-result ${
                    isCorrect ? "correct" : "incorrect"
                  }`}
                >
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span
                      className={`result-icon ${
                        isCorrect ? "correct" : "incorrect"
                      }`}
                    >
                      <span className="material-icons">
                        {isCorrect ? "check" : "close"}
                      </span>
                    </span>
                  </div>
                  <div className="question-text">{question.question}</div>
                  {question.type === "multiple_choice" && (
                    <div className="answer-review">
                      <div className="user-answer">
                        Your answer:{" "}
                        {question.options[userAnswer] || "Not answered"}
                      </div>
                      <div className="correct-answer">
                        Correct answer:{" "}
                        {question.options[question.correct_answer]}
                      </div>
                    </div>
                  )}
                  {question.type === "true_false" && (
                    <div className="answer-review">
                      <div className="user-answer">
                        Your answer:{" "}
                        {userAnswer !== undefined
                          ? userAnswer
                            ? "True"
                            : "False"
                          : "Not answered"}
                      </div>
                      <div className="correct-answer">
                        Correct answer:{" "}
                        {question.correct_answer ? "True" : "False"}
                      </div>
                    </div>
                  )}
                  <div className="explanation">{question.explanation}</div>
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button className="nav-btn secondary" onClick={restartAssessment}>
              Retake Assessment
            </button>
            <button className="nav-btn primary" onClick={onComplete}>
              Complete Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="assessment-header">
        <h1>{assessment.title}</h1>
        <div className="assessment-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / totalQuestions) * 100
                }%`,
              }}
            ></div>
          </div>
          <span className="progress-text">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
      </div>

      <div className="question-container">
        <div className="question-card">
          <div className="question-header">
            <span className="question-number">
              Question {currentQuestionIndex + 1}
            </span>
            <span className="question-type">
              {currentQuestion.type === "multiple_choice"
                ? "Multiple Choice"
                : "True/False"}
            </span>
          </div>

          <div className="question-text">{currentQuestion.question}</div>

          <div className="answer-options">
            {currentQuestion.type === "multiple_choice" && (
              <div className="multiple-choice-options">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="option-label">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={index}
                      checked={userAnswers[currentQuestion.id] === index}
                      onChange={() => handleAnswerSelect(index)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "true_false" && (
              <div className="true-false-options">
                <label className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="true"
                    checked={userAnswers[currentQuestion.id] === true}
                    onChange={() => handleAnswerSelect(true)}
                  />
                  <span className="option-text">True</span>
                </label>
                <label className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="false"
                    checked={userAnswers[currentQuestion.id] === false}
                    onChange={() => handleAnswerSelect(false)}
                  />
                  <span className="option-text">False</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="navigation-buttons">
          <div className="nav-left">
            {currentQuestionIndex > 0 && (
              <button className="nav-btn secondary" onClick={handlePrevious}>
                ← Previous
              </button>
            )}
          </div>

          <div className="nav-right">
            <button
              className="nav-btn primary"
              onClick={handleNext}
              disabled={userAnswers[currentQuestion.id] === undefined}
            >
              {currentQuestionIndex < totalQuestions - 1
                ? "Next →"
                : "Finish Assessment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Assessment = Assessment;
