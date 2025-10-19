#!/usr/bin/env python3
"""
Test script for the assessment builder functionality
"""
import sys
import json
from pathlib import Path

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent))

from crew import LearningAppCrew

def test_assessment_builder():
    """Test the assessment builder with a sample course"""
    
    # Initialize the crew
    crew = LearningAppCrew()
    
    # Check if there are any existing course files
    outputs_dir = Path(__file__).parent / 'outputs'
    course_files = list(outputs_dir.glob('final_course_*.json'))
    
    if not course_files:
        print("No course files found. Creating a sample course first...")
        
        # Create a simple sample course for testing
        sample_course = {
            "course": {
                "lesson_1": {
                    "title": "Introduction to Python Variables",
                    "key_concepts": ["Variables", "Data Types", "Assignment"],
                    "key_terms": {
                        "variable": "A named storage location for data",
                        "string": "A sequence of characters",
                        "integer": "A whole number"
                    },
                    "main_lesson_text": "In Python, variables are used to store data values. Unlike other programming languages, Python has no command for declaring a variable.\n\nA variable is created the moment you first assign a value to it. For example, x = 5 creates a variable named x with the value 5.\n\nPython supports different data types including strings (text), integers (whole numbers), and floats (decimal numbers)."
                },
                "lesson_2": {
                    "title": "Python Data Types and Operations",
                    "key_concepts": ["Strings", "Numbers", "Boolean", "Type Conversion"],
                    "key_terms": {
                        "float": "A number with decimal places",
                        "boolean": "A true or false value",
                        "type conversion": "Converting from one data type to another"
                    },
                    "main_lesson_text": "Python has several built-in data types. The most common are strings, integers, floats, and booleans.\n\nStrings are enclosed in quotes: name = 'Alice'. Numbers can be integers (5) or floats (3.14). Booleans are either True or False.\n\nYou can convert between types using functions like str(), int(), and float(). This is called type conversion or casting."
                }
            }
        }
        
        # Save the sample course
        sample_file = outputs_dir / 'final_course_Python_Basics_test.json'
        outputs_dir.mkdir(exist_ok=True)
        
        with open(sample_file, 'w') as f:
            json.dump(sample_course, f, indent=2)
        
        course_file_path = str(sample_file)
        print(f"Created sample course: {sample_file}")
    else:
        # Use the most recent course file
        course_file_path = str(max(course_files, key=lambda f: f.stat().st_mtime))
        print(f"Using existing course file: {course_file_path}")
    
    try:
        print("\n" + "="*50)
        print("TESTING ASSESSMENT BUILDER")
        print("="*50)
        
        # Build assessment
        result = crew.build_assessment(course_file_path)
        
        print("\nAssessment building completed!")
        print("\nResult structure:")
        print(f"- Type: {type(result)}")
        
        if isinstance(result, dict):
            print(f"- Keys: {list(result.keys())}")
            
            if 'assessment' in result:
                assessment = result['assessment']
                print(f"- Assessment title: {assessment.get('title', 'N/A')}")
                print(f"- Number of questions: {len(assessment.get('questions', []))}")
                
                # Show first question as example
                questions = assessment.get('questions', [])
                if questions:
                    first_q = questions[0]
                    print(f"\nSample question:")
                    print(f"  ID: {first_q.get('id')}")
                    print(f"  Type: {first_q.get('type')}")
                    print(f"  Question: {first_q.get('question')}")
                    print(f"  Difficulty: {first_q.get('difficulty')}")
                    
                    if first_q.get('type') == 'multiple_choice':
                        print(f"  Options: {first_q.get('options')}")
                        print(f"  Correct answer: {first_q.get('correct_answer')}")
                    else:
                        print(f"  Correct answer: {first_q.get('correct_answer')}")
            
            if 'error' in result:
                print(f"- Error: {result['error']}")
        
        # Check if assessment was saved
        assessments_dir = outputs_dir / 'assessments'
        if assessments_dir.exists():
            assessment_files = list(assessments_dir.glob('assessment_*.json'))
            if assessment_files:
                latest_assessment = max(assessment_files, key=lambda f: f.stat().st_mtime)
                print(f"\nAssessment saved to: {latest_assessment}")
            else:
                print("\nNo assessment files found in outputs/assessments/")
        else:
            print("\nAssessments directory not created")
        
        return result
        
    except Exception as e:
        print(f"Error during assessment building: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    test_assessment_builder()
