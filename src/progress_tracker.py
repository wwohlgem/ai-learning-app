"""
Progress tracking system for AI Learning App
Handles real-time progress updates during course creation
"""
import json
import time
from typing import Dict, List, Callable
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class ProgressStage:
    """Represents a single stage in the course creation process"""
    id: str
    title: str
    description: str
    status: str  # 'pending', 'running', 'completed', 'error'
    start_time: str = None
    end_time: str = None
    progress_percent: int = 0
    details: str = ""

class ProgressTracker:
    """Tracks and broadcasts progress of course creation"""
    
    def __init__(self):
        self.stages: Dict[str, ProgressStage] = {}
        self.callbacks: List[Callable] = []
        self.current_stage = None
        
        # Define the standard stages for course creation
        self._initialize_stages()
    
    def _initialize_stages(self):
        """Initialize the standard progress stages"""
        stages_config = [
            {
                "id": "curriculum_building",
                "title": "Building Curriculum",
                "description": "AI agent is analyzing your subject and creating a course structure..."
            },
            {
                "id": "content_creation", 
                "title": "Creating Content",
                "description": "AI agent is researching and writing detailed lesson content..."
            },
            {
                "id": "content_review",
                "title": "Reviewing & Structuring",
                "description": "AI agent is reviewing content quality and structuring the final course..."
            },
            {
                "id": "finalization",
                "title": "Finalizing Course",
                "description": "Packaging your personalized course and preparing for delivery..."
            }
        ]
        
        for stage_config in stages_config:
            stage = ProgressStage(
                id=stage_config["id"],
                title=stage_config["title"],
                description=stage_config["description"],
                status="pending"
            )
            self.stages[stage.id] = stage
    
    def add_callback(self, callback: Callable):
        """Add a callback function to receive progress updates"""
        self.callbacks.append(callback)
    
    def remove_callback(self, callback: Callable):
        """Remove a callback function"""
        if callback in self.callbacks:
            self.callbacks.remove(callback)
    
    def _broadcast_update(self):
        """Broadcast current progress to all callbacks"""
        progress_data = {
            "stages": [asdict(stage) for stage in self.stages.values()],
            "current_stage": self.current_stage,
            "overall_progress": self._calculate_overall_progress(),
            "timestamp": datetime.now().isoformat()
        }
        
        for callback in self.callbacks:
            try:
                callback(progress_data)
            except Exception as e:
                print(f"Error in progress callback: {e}")
    
    def _calculate_overall_progress(self) -> int:
        """Calculate overall progress percentage"""
        if not self.stages:
            return 0
        
        total_progress = sum(stage.progress_percent for stage in self.stages.values())
        return min(100, total_progress // len(self.stages))
    
    def start_stage(self, stage_id: str, details: str = ""):
        """Start a specific stage"""
        if stage_id in self.stages:
            stage = self.stages[stage_id]
            stage.status = "running"
            stage.start_time = datetime.now().isoformat()
            stage.progress_percent = 0
            stage.details = details
            self.current_stage = stage_id
            
            print(f"Started: {stage.title}")
            self._broadcast_update()
    
    def update_stage_progress(self, stage_id: str, progress_percent: int, details: str = ""):
        """Update progress for a specific stage"""
        if stage_id in self.stages:
            stage = self.stages[stage_id]
            stage.progress_percent = min(100, max(0, progress_percent))
            if details:
                stage.details = details
            
            self._broadcast_update()
    
    def complete_stage(self, stage_id: str, details: str = ""):
        """Mark a stage as completed"""
        if stage_id in self.stages:
            stage = self.stages[stage_id]
            stage.status = "completed"
            stage.end_time = datetime.now().isoformat()
            stage.progress_percent = 100
            if details:
                stage.details = details
            
            print(f"Completed: {stage.title}")
            self._broadcast_update()
    
    def error_stage(self, stage_id: str, error_message: str):
        """Mark a stage as having an error"""
        if stage_id in self.stages:
            stage = self.stages[stage_id]
            stage.status = "error"
            stage.end_time = datetime.now().isoformat()
            stage.details = f"Error: {error_message}"
            
            print(f"Error in: {stage.title} - {error_message}")
            self._broadcast_update()
    
    def reset(self):
        """Reset all stages to pending"""
        for stage in self.stages.values():
            stage.status = "pending"
            stage.start_time = None
            stage.end_time = None
            stage.progress_percent = 0
            stage.details = ""
        
        self.current_stage = None
        self._broadcast_update()
    
    def get_current_progress(self) -> dict:
        """Get current progress state"""
        return {
            "stages": [asdict(stage) for stage in self.stages.values()],
            "current_stage": self.current_stage,
            "overall_progress": self._calculate_overall_progress(),
            "timestamp": datetime.now().isoformat()
        }

# Global progress tracker instance
progress_tracker = ProgressTracker()
