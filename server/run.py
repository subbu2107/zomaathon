import eventlet
eventlet.monkey_patch()

from server.app import create_app, socketio
import os

# Create Flask application instance
app = create_app()

# Automatically create database tables if they don't exist
with app.app_context():
    from server.app import db
    db.create_all()
    print("Database tables verified/created.")

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
