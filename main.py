#!/usr/bin/env python3
"""
AI Learning App - CrewAI Project
"""
import sys
from crew import LearningAppCrew

def run():
    """
    Run the crew to create a course
    """
    # Default parameters - can be modified or made interactive
    subject = input("What subject would you like to learn about? ") or "Einstein's Theory of Relativity"
    
    print("\nHow many lessons would you like?")
    print("1 - Quick overview")
    print("2 - Moderate depth") 
    print("3 - Comprehensive")
    
    try:
        num_lessons = int(input("Enter choice (1-3): ") or "2")
        if num_lessons not in [1, 2, 3]:
            num_lessons = 2
    except ValueError:
        num_lessons = 2
    
    print(f"\n🚀 Creating course: '{subject}' with {num_lessons} lessons")
    print("🤖 Starting CrewAI workflow...")
    
    # Initialize and run the crew
    crew = LearningAppCrew()
    result = crew.create_course(subject, num_lessons)
    
    print("\n✅ Course creation complete!")
    print("📁 Check the outputs/ directory for your course files")
    
    return result

def train():
    """
    Train the crew for better performance
    """
    print("🎯 Training mode - running with sample data to improve performance")
    
    # Use sample data for training
    sample_subjects = [
        "Introduction to Python Programming",
        "Basic Photography Techniques", 
        "Ancient Roman History"
    ]
    
    crew = LearningAppCrew()
    
    for subject in sample_subjects:
        print(f"📚 Training with: {subject}")
        try:
            crew.create_course(subject, 2)
            print(f"✅ Training completed for: {subject}")
        except Exception as e:
            print(f"❌ Training failed for {subject}: {e}")
    
    print("🎉 Training session complete!")

def replay():
    """
    Replay the crew execution from the last run
    """
    print("🔄 Replay functionality - re-running last course creation")
    
    # For now, just run with default parameters
    crew = LearningAppCrew()
    result = crew.create_course("Einstein's Theory of Relativity", 2)
    
    return result

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == 'train':
            train()
        elif command == 'replay':
            replay()
        else:
            print("Available commands: train, replay")
            print("Or run without arguments for interactive mode")
    else:
        run()
