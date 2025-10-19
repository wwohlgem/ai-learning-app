#!/usr/bin/env python3
"""
Quick test script to verify the CrewAI agents are working correctly
"""
import sys
import os
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from crew import LearningAppCrew

def test_basic_functionality():
    """Test the crew with a simple subject"""
    print("🧪 Testing AI Learning App Crew...")
    print("=" * 50)
    
    try:
        # Initialize the crew
        crew = LearningAppCrew()
        print("✅ Crew initialized successfully")
        
        # Test with a simple subject
        subject = "Einstein's Theory of Relativity"
        num_lessons = 2
        
        print(f"📚 Creating course: {subject} ({num_lessons} lessons)")
        print("🤖 Starting agent workflow...")
        
        result = crew.create_course(subject, num_lessons)
        
        print("\n🎉 Course creation completed!")
        print(f"📁 Check the outputs/ directory for generated files")
        
        # Print a summary of the result
        if isinstance(result, dict) and 'course' in result:
            print("\n📊 Course Summary:")
            course = result['course']
            for lesson_key, lesson_data in course.items():
                print(f"  • {lesson_data.get('title', 'Untitled Lesson')}")
        else:
            print(f"\n📄 Raw result: {str(result)[:200]}...")
            
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("💡 Make sure you have:")
        print("   - Added your API keys to the .env file")
        print("   - SERPER_API_KEY from serper.dev")
        print("   - OPENAI_API_KEY from platform.openai.com")
        return False

if __name__ == "__main__":
    success = test_basic_functionality()
    sys.exit(0 if success else 1)
