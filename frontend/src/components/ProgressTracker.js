const { useState, useEffect } = React;

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
        return "✅";
      case "running":
        return "🔄";
      case "error":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStageClass = (status) => {
    return `progress-stage ${status}`;
  };

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h2>🤖 AI Agents Creating Your Course</h2>
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
              <div className="stage-icon">{getStageIcon(stage.status)}</div>
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

window.ProgressTracker = ProgressTracker;
