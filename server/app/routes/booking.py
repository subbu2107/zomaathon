from flask import Blueprint, request, jsonify
from server.app import db
from server.app.models.interactions import TableBooking
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    try:
        booking_date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
        booking_time = datetime.strptime(data.get('time'), '%H:%M').time()
        
        booking = TableBooking(
            user_id=user_id,
            restaurant_id=data.get('restaurant_id'),
            booking_date=booking_date,
            booking_time=booking_time,
            guests=data.get('guests')
        )
        db.session.add(booking)
        db.session.commit()
        return jsonify(booking.to_dict()), 201
    except Exception as e:
        return jsonify({"msg": str(e)}), 400

@booking_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def get_my_bookings():
    user_id = get_jwt_identity()
    bookings = TableBooking.query.filter_by(user_id=user_id).order_by(TableBooking.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookings]), 200
