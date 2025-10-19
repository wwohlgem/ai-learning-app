"""
Simple Flask web server to integrate frontend with CrewAI backend
"""
import os
import json
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))
from crew import LearningAppCrew
from src.progress_tracker import progress_tracker

app = Flask(__name__, 
            template_folder='../frontend/public',
            static_folder='../frontend/public')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize the crew
crew = LearningAppCrew()

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    # Send current progress state to newly connected client
    emit('progress_update', progress_tracker.get_current_progress())

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

def broadcast_progress(progress_data):
    """Broadcast progress updates to all connected clients"""
    socketio.emit('progress_update', progress_data)

# Register progress tracker callback
progress_tracker.add_callback(broadcast_progress)

@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory('../frontend/public', 'index.html')

@app.route('/styles.css')
def styles():
    """Serve the CSS file"""
    return send_from_directory('../frontend/public', 'styles.css')

@app.route('/src/<path:filename>')
def src_files(filename):
    """Serve files from the src directory"""
    return send_from_directory('../frontend/src', filename)

@app.route('/api/create-course', methods=['POST'])
def create_course():
    """API endpoint to create a course using CrewAI"""
    try:
        data = request.get_json()
        subject = data.get('subject', '').strip()
        num_lessons = data.get('numLessons', 1)
        
        if not subject:
            return jsonify({'error': 'Subject is required'}), 400
        
        if not isinstance(num_lessons, int) or num_lessons < 1 or num_lessons > 3:
            return jsonify({'error': 'Number of lessons must be between 1 and 3'}), 400
        
        # Reset progress tracker for new course creation
        progress_tracker.reset()
        
        # Create course using CrewAI
        print(f"Creating course for subject: {subject}, lessons: {num_lessons}")
        result = crew.create_course(subject, num_lessons)
        
        # The crew.create_course method now returns a properly formatted JSON object
        # or an error dict if parsing failed
        if isinstance(result, dict) and 'error' in result:
            return jsonify({
                'error': result['error'],
                'raw_result': result.get('raw_result', '')
            }), 500
        
        # Validate that we have a proper course structure
        if not isinstance(result, dict) or 'course' not in result:
            return jsonify({
                'error': 'Invalid course data format - missing course structure',
                'received_data': str(result)[:500] + "..." if len(str(result)) > 500 else str(result)
            }), 500
        
        return jsonify({
            'success': True,
            'course_data': result
        })
        
    except Exception as e:
        print(f"Error creating course: {str(e)}")
        return jsonify({
            'error': f'Failed to create course: {str(e)}'
        }), 500

@app.route('/api/outputs')
def list_outputs():
    """List all generated course outputs"""
    try:
        outputs_dir = Path(__file__).parent.parent / 'outputs'
        if not outputs_dir.exists():
            return jsonify({'outputs': []})
        
        outputs = []
        for file_path in outputs_dir.glob('*.json'):
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                outputs.append({
                    'filename': file_path.name,
                    'created': file_path.stat().st_mtime,
                    'preview': str(data)[:200] + '...' if len(str(data)) > 200 else str(data)
                })
            except Exception:
                continue
        
        # Sort by creation time, newest first
        outputs.sort(key=lambda x: x['created'], reverse=True)
        return jsonify({'outputs': outputs})
        
    except Exception as e:
        return jsonify({'error': f'Failed to list outputs: {str(e)}'}), 500

@app.route('/api/outputs/<filename>')
def get_output(filename):
    """Get a specific output file"""
    try:
        outputs_dir = Path(__file__).parent.parent / 'outputs'
        file_path = outputs_dir / filename
        
        if not file_path.exists():
            return jsonify({'error': 'File not found'}), 404
        
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        return jsonify(data)
        
    except Exception as e:
        return jsonify({'error': f'Failed to get output: {str(e)}'}), 500

@app.route('/api/progress')
def get_progress():
    """Get current progress state"""
    return jsonify(progress_tracker.get_current_progress())

if __name__ == '__main__':
    print("Starting AI Learning App server...")
    print("Frontend available at: http://localhost:5000")
    print("API endpoints:")
    print("  POST /api/create-course - Create a new course")
    print("  GET /api/outputs - List all generated outputs")
    print("  GET /api/outputs/<filename> - Get specific output")
    print("  GET /api/progress - Get current progress state")
    print("WebSocket events:")
    print("  progress_update - Real-time progress updates")
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
