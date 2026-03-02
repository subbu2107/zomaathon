from app import create_app, socketio
import os

# 'app' is the name Gunicorn will look for by default
app = create_app()

if __name__ == '__main__':
    # Render provides the PORT environment variable
    port = int(os.getenv('PORT', 10000))
    # Listen on 0.0.0.0 in production to accept external connections
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=False
    )