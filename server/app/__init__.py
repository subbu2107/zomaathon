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

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # Initialize Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    CORS(app)

    # Import and register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.restaurant import restaurant_bp
    from app.routes.menu import menu_bp
    from app.routes.order import order_bp
    from app.routes.user import user_bp
    from app.routes.interactions import interaction_bp
    from app.routes.coupon import coupon_bp
    from app.routes.payment import payment_bp
    from app.routes.booking import booking_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(restaurant_bp, url_prefix='/api/restaurants')
    app.register_blueprint(menu_bp, url_prefix='/api/menu')
    app.register_blueprint(order_bp, url_prefix='/api/orders')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(interaction_bp, url_prefix='/api/interactions')
    app.register_blueprint(coupon_bp, url_prefix='/api/coupons')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')

    from app import socket_events

    return app
