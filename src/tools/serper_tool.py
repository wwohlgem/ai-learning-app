"""
Serper search tool for CrewAI agents
"""
import os
import requests
from crewai_tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field


class SerperSearchInput(BaseModel):
    """Input schema for Serper search."""
    query: str = Field(..., description="Search query to research")


class SerperSearchTool(BaseTool):
    name: str = "Search the web"
    description: str = "A tool that can be used to search the web for information on any topic"
    args_schema: Type[BaseModel] = SerperSearchInput
    
    def _run(self, query: str) -> str:
        """Execute the search using Serper API."""
        api_key = os.getenv("SERPER_API_KEY")
        if not api_key:
            return "Error: SERPER_API_KEY not found in environment variables"
        
        url = "https://google.serper.dev/search"
        
        payload = {
            'q': query,
            'num': 5
        }
        
        headers = {
            'X-API-KEY': api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            results = response.json()
            
            # Format the results
            formatted_results = []
            
            if 'organic' in results:
                for result in results['organic'][:5]:  # Top 5 results
                    formatted_results.append(
                        f"Title: {result.get('title', 'N/A')}\n"
                        f"Link: {result.get('link', 'N/A')}\n"
                        f"Snippet: {result.get('snippet', 'N/A')}\n"
                    )
            
            if not formatted_results:
                return f"No search results found for query: {query}"
            
            return "\n".join(formatted_results)
            
        except requests.exceptions.RequestException as e:
            return f"Error searching: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"
