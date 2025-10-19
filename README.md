# AI Learning App

An AI-powered learning application that builds personalized courses on any subject using CrewAI agents. The system uses three specialized agents to research, create, and structure educational content.

## Features

- **Curriculum Builder Agent**: Creates structured lesson outlines based on user parameters
- **Lesson Builder Agent**: Researches and writes comprehensive lesson content using Serper API
- **Content Reviewer Agent**: Structures content into organized educational materials
- **React Frontend**: Clean, responsive interface for course creation and viewing
- **Real-time Course Generation**: Watch as AI agents collaborate to build your course

## Architecture

The application consists of:

1. **CrewAI Backend** - Three specialized AI agents working together
2. **React Frontend** - User interface for course creation and viewing
3. **Flask Web Server** - API integration between frontend and backend
4. **Serper Integration** - Web search capabilities for research

## Prerequisites

- Python 3.13+ (already installed)
- uv package manager (already installed)
- API Keys:
  - Serper API key (for web search)
  - OpenAI API key (for LLM functionality)

## Setup Instructions

### 1. Environment Setup

The project is already initialized, but you need to add your API keys:

```bash
# Edit the .env file
nano .env
```

Replace the placeholder values with your actual API keys:

```
SERPER_API_KEY=your_actual_serper_api_key_here
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 2. Get API Keys

**Serper API Key:**

1. Go to [serper.dev](https://serper.dev)
2. Sign up for a free account
3. Get your API key from the dashboard

**OpenAI API Key:**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

### 3. Running the Application

#### Option 1: Run the Full Web Application (Recommended)

Start the Flask server which serves both the frontend and API:

```bash
cd ai-learning-app
export PATH="$HOME/.local/bin:$PATH"
uv run python src/web_server.py
```

If port 5000 is in use (AirPlay on macOS), run on port 8000:

```bash
cd ai-learning-app
export PATH="$HOME/.local/bin:$PATH"
uv run python -c "
import sys
sys.path.append('src')
from web_server import app
app.run(debug=True, host='0.0.0.0', port=8000)
"
```

Then open your browser to: **http://localhost:5000** (or **http://localhost:8000**)

#### Option 2: Test CrewAI Backend Only

To test just the CrewAI functionality:

```bash
cd ai-learning-app
export PATH="$HOME/.local/bin:$PATH"
uv run python crew.py
```

#### Option 3: Interactive CLI Mode

For command-line interaction:

```bash
cd ai-learning-app
export PATH="$HOME/.local/bin:$PATH"
uv run python main.py
```

## Usage

1. **Enter a Subject**: Type any topic you want to learn about
2. **Choose Depth**: Select 1-3 lessons based on how deep you want to go
3. **Create Course**: Click the button and watch the AI agents work
4. **View Results**: The structured course will appear with:
   - Key concepts for each lesson
   - Important terms and definitions
   - Comprehensive lesson content

## Project Structure

```
ai-learning-app/
├── config/
│   ├── agents.yaml          # Agent configurations
│   └── tasks.yaml           # Task definitions
├── src/
│   ├── agents/              # (Legacy - now using YAML)
│   ├── tools/
│   │   ├── __init__.py      # Tool initialization
│   │   └── serper_tool.py   # Custom Serper tool (unused)
│   ├── crew.py              # Main CrewAI orchestration
│   └── web_server.py        # Flask web server
├── frontend/
│   ├── public/
│   │   ├── index.html       # Main HTML file
│   │   └── styles.css       # CSS styles
│   └── src/
│       └── App.js           # React application
├── outputs/                 # Generated course files
├── .env                     # Environment variables
├── pyproject.toml          # Python dependencies
└── README.md               # This file
```

## API Endpoints

- `GET /` - Serve the frontend
- `POST /api/create-course` - Create a new course
- `GET /api/outputs` - List all generated courses
- `GET /api/outputs/<filename>` - Get specific course file

## Example Course Output

The system generates structured JSON containing:

```json
{
  "course": {
    "lesson_1": {
      "title": "Introduction to Topic",
      "key_concepts": ["Concept 1", "Concept 2"],
      "key_terms": {
        "Term 1": "Definition 1",
        "Term 2": "Definition 2"
      },
      "main_lesson_text": "Comprehensive lesson content..."
    }
  }
}
```

## Customization

### Adding New Agents

1. Edit `config/agents.yaml` to add new agent configurations
2. Edit `config/tasks.yaml` to add corresponding tasks
3. Update `src/crew.py` to include the new agents in the workflow

### Modifying Agent Behavior

- Edit the YAML files to change agent roles, goals, and backstories
- Modify task descriptions to change output formats
- Adjust agent parameters like `max_iter` for different performance

### Frontend Customization

- Modify `frontend/src/App.js` for UI changes
- Update `frontend/public/styles.css` for styling
- Add new components in the `frontend/src/components/` directory

## Troubleshooting

### Common Issues

1. **API Keys Not Working**: Make sure you've replaced the placeholder values in `.env`
2. **Dependencies Missing**: Run `uv sync` to ensure all packages are installed
3. **Port Already in Use**: Change the port in `web_server.py` or kill the existing process
4. **Agent Errors**: Check the console output for detailed error messages

### Debug Mode

The Flask server runs in debug mode by default. Check the terminal output for detailed logs of the agent workflow.

### Output Files

Generated courses are saved in the `outputs/` directory with timestamps. You can examine these files to see the raw agent outputs.

## Next Steps for Production

1. **Add Authentication**: Implement user accounts and course storage
2. **Database Integration**: Store courses in a proper database
3. **Enhanced UI**: Add course management, editing capabilities
4. **API Rate Limiting**: Implement proper rate limiting for production use
5. **Error Handling**: Add comprehensive error handling and recovery
6. **Testing**: Add unit tests for agents and API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please check the license file for details.
