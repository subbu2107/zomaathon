from server.app import create_app, socketio
import os

# Create Flask application instance
app = create_app()

# This block runs only when executing directly (not via Gunicorn)
if __name__ == "__main__":
    # Render provides PORT automatically
    port = int(os.getenv("PORT", 10000))

    # Run with SocketIO in development mode
    socketio.run(
        app,
        host="0.0.0.0",
        port=port,
        debug=False
    )
