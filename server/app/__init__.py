from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_socketio import SocketIO
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Allowed Origins for Production and Development
allowed_origins = [
    "https://zomaathon-1.onrender.com",
    "https://zomathon-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
]

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins=allowed_origins, async_mode="eventlet")


def create_app():
    app = Flask(__name__)

    # Fix Render postgres URL issue
    database_url = os.getenv("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    
    # Configure CORS with credentials support
    CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

    @app.route('/')
    def health_check():
        return {"status": "healthy", "service": "Zomathon Backend"}, 200

    # ✅ FIXED IMPORTS (IMPORTANT)
    from server.app.routes.auth import auth_bp
    from server.app.routes.restaurant import restaurant_bp
    from server.app.routes.menu import menu_bp
    from server.app.routes.order import order_bp
    from server.app.routes.user import user_bp
    from server.app.routes.interactions import interaction_bp
    from server.app.routes.coupon import coupon_bp
    from server.app.routes.payment import payment_bp
    from server.app.routes.booking import booking_bp

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(restaurant_bp, url_prefix="/api/restaurants")
    app.register_blueprint(menu_bp, url_prefix="/api/menu")
    app.register_blueprint(order_bp, url_prefix="/api/orders")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(interaction_bp, url_prefix="/api/interactions")
    app.register_blueprint(coupon_bp, url_prefix="/api/coupons")
    app.register_blueprint(payment_bp, url_prefix="/api/payments")
    app.register_blueprint(booking_bp, url_prefix="/api/bookings")

    # ✅ Fix socket events import
    from server.app import socket_events

    return app
