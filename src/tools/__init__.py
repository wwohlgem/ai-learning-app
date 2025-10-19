"""
Tools initialization for the AI Learning App
"""
from crewai_tools import SerperDevTool

def get_search_tool():
    """Get the Serper search tool."""
    return SerperDevTool()
