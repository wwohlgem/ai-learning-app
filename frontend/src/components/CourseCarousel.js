const { useState, useEffect } = React;

function CourseCarousel({ onCourseSelect }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch courses");
      }

      setCourses(data.courses || []);
    } catch (err) {
      setError(`Failed to load existing courses: ${err.message}`);
      console.error("Course fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course) => {
    onCourseSelect({
      courseData: course.course_data,
      subject: course.subject,
      numLessons: course.lesson_count,
    });
  };

  if (loading) {
    return (
      <div className="course-carousel">
        <div className="carousel-header">
          <h2>📚 Your Previous Courses</h2>
        </div>
        <div className="carousel-loading">Loading your courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-carousel">
        <div className="carousel-header">
          <h2>Your Previous Courses</h2>
        </div>
        <div className="carousel-error">{error}</div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="course-carousel">
        <div className="carousel-header">
          <h2>Your Previous Courses</h2>
        </div>
        <div className="carousel-empty">
          No previous courses found. Create your first course below!
        </div>
      </div>
    );
  }

  return (
    <div className="course-carousel">
      <div className="carousel-header">
        <h2>Your Previous Courses</h2>
        <p>Continue learning or get inspired for your next course</p>
      </div>

      <div className="carousel-container">
        <div className="carousel-track">
          {courses.map((course) => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => handleCourseClick(course)}
            >
              <div className="course-card-header">
                <h3>{course.subject}</h3>
                <span className="lesson-count">
                  {course.lesson_count} lesson
                  {course.lesson_count !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.CourseCarousel = CourseCarousel;
