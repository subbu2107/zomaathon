from app import create_app, socketio
import os

flask_app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    # Using socketio.run for real-time capabilities
    socketio.run(flask_app, debug=True, port=port)
