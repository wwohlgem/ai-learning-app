"""
Main CrewAI setup for the AI Learning App
"""
import os
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool
import yaml

# Load environment variables
load_dotenv()

class LearningAppCrew:
    """Main crew class for the AI Learning Application"""
    
    def __init__(self):
        self.config_path = Path(__file__).parent / "config"
        self.outputs_path = Path(__file__).parent / "outputs"
        self.outputs_path.mkdir(exist_ok=True)
        
        # Load configurations
        self.agents_config = self._load_yaml("agents.yaml")
        self.tasks_config = self._load_yaml("tasks.yaml")
        
        # Initialize tools
        self.search_tool = SerperDevTool()
    
    def _load_yaml(self, filename):
        """Load YAML configuration file"""
        with open(self.config_path / filename, 'r') as file:
            return yaml.safe_load(file)
    
    def _create_agents(self):
        """Create agents from configuration"""
        curriculum_builder = Agent(
            role=self.agents_config['curriculum_builder']['role'],
            goal=self.agents_config['curriculum_builder']['goal'],
            backstory=self.agents_config['curriculum_builder']['backstory'],
            verbose=True,
            allow_delegation=False,
            max_iter=3
        )
        
        lesson_builder = Agent(
            role=self.agents_config['lesson_builder']['role'],
            goal=self.agents_config['lesson_builder']['goal'],
            backstory=self.agents_config['lesson_builder']['backstory'],
            tools=[self.search_tool],
            verbose=True,
            allow_delegation=False,
            max_iter=5
        )
        
        content_reviewer = Agent(
            role=self.agents_config['content_reviewer']['role'],
            goal=self.agents_config['content_reviewer']['goal'],
            backstory=self.agents_config['content_reviewer']['backstory'],
            verbose=True,
            allow_delegation=False,
            max_iter=3
        )
        
        return curriculum_builder, lesson_builder, content_reviewer
    
    def _create_tasks(self, subject: str, num_lessons: int, agents):
        """Create tasks from configuration"""
        curriculum_builder, lesson_builder, content_reviewer = agents
        
        # Task 1: Build curriculum
        build_curriculum_task = Task(
            description=self.tasks_config['build_curriculum']['description'].format(
                subject=subject, 
                num_lessons=num_lessons
            ),
            expected_output=self.tasks_config['build_curriculum']['expected_output'],
            agent=curriculum_builder,
            output_file=f"outputs/curriculum_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        
        # Task 2: Create lesson content
        create_content_task = Task(
            description=self.tasks_config['create_lesson_content']['description'],
            expected_output=self.tasks_config['create_lesson_content']['expected_output'],
            agent=lesson_builder,
            output_file=f"outputs/lessons_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            context=[build_curriculum_task]
        )
        
        # Task 3: Structure final course
        structure_course_task = Task(
            description=self.tasks_config['structure_final_course']['description'],
            expected_output=self.tasks_config['structure_final_course']['expected_output'],
            agent=content_reviewer,
            output_file=f"outputs/final_course_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
            context=[create_content_task]
        )
        
        return [build_curriculum_task, create_content_task, structure_course_task]
    
    def create_course(self, subject: str, num_lessons: int):
        """Main method to create a course"""
        print(f"Starting course creation for: {subject} with {num_lessons} lessons")
        
        # Create agents
        agents = self._create_agents()
        
        # Create tasks
        tasks = self._create_tasks(subject, num_lessons, agents)
        
        # Create and run crew
        crew = Crew(
            agents=list(agents),
            tasks=tasks,
            process=Process.sequential,
            verbose=True
        )
        
        # Execute the crew
        result = crew.kickoff()
        
        # Extract the actual result from CrewOutput
        if hasattr(result, 'raw'):
            raw_result = result.raw
        elif hasattr(result, 'result'):
            raw_result = result.result
        else:
            raw_result = str(result)
        
        # Save final result
        output_file = self.outputs_path / f"course_{subject.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Try to parse result as JSON, handling markdown formatting
        try:
            if isinstance(raw_result, str):
                # Strip markdown code blocks if present
                cleaned_result = raw_result.strip()
                if cleaned_result.startswith('```json'):
                    cleaned_result = cleaned_result[7:]  # Remove ```json
                if cleaned_result.startswith('```'):
                    cleaned_result = cleaned_result[3:]   # Remove ```
                if cleaned_result.endswith('```'):
                    cleaned_result = cleaned_result[:-3]  # Remove ending ```
                cleaned_result = cleaned_result.strip()
                
                json_result = json.loads(cleaned_result)
            elif isinstance(raw_result, dict):
                json_result = raw_result
            else:
                # If it's not a string or dict, convert to string and try parsing
                cleaned_result = str(raw_result).strip()
                if cleaned_result.startswith('```json'):
                    cleaned_result = cleaned_result[7:]
                if cleaned_result.startswith('```'):
                    cleaned_result = cleaned_result[3:]
                if cleaned_result.endswith('```'):
                    cleaned_result = cleaned_result[:-3]
                cleaned_result = cleaned_result.strip()
                
                json_result = json.loads(cleaned_result)
            
            with open(output_file, 'w') as f:
                json.dump(json_result, f, indent=2)
                
            print(f"Course creation completed! Result saved to: {output_file}")
            return json_result
            
        except json.JSONDecodeError as e:
            # If result is still not valid JSON, save as text and provide more info
            with open(output_file.with_suffix('.txt'), 'w') as f:
                f.write(str(raw_result))
            
            print(f"Course creation completed! Result saved to: {output_file} (as text)")
            print(f"JSON parsing error: {e}")
            
            # Return a structured error for the frontend
            return {
                "error": f"Could not parse result as JSON: {str(e)}",
                "raw_result": str(raw_result)[:1000] + "..." if len(str(raw_result)) > 1000 else str(raw_result)
            }

def main():
    """Example usage"""
    crew = LearningAppCrew()
    
    # Example: Create a course on Python basics with 2 lessons
    subject = "Python Programming Basics"
    num_lessons = 2
    
    result = crew.create_course(subject, num_lessons)
    print("Course creation completed!")

if __name__ == "__main__":
    main()
