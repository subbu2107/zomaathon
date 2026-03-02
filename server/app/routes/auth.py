from flask import Blueprint, request, jsonify
from server.app import db, bcrypt
from server.app.models.user import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"msg": "Email already registered"}), 400
    
    new_user = User(
        full_name=data.get('full_name'),
        email=data.get('email'),
        phone=data.get('phone'),
        role=data.get('role', 'user')
    )
    new_user.set_password(data.get('password'))
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role},
            expires_delta=datetime.timedelta(days=1)
        )
        return jsonify({
            "access_token": access_token,
            "user": user.to_dict()
        }), 200
    
    return jsonify({"msg": "Invalid email or password"}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(user.to_dict()), 200
