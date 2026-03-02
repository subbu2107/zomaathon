from flask import Blueprint, request, jsonify
from server.app import db
from server.app.models.user import Address
from server.app.models.interactions import Favorite
from server.app.models.restaurant import Restaurant
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint('user', __name__)

@user_bp.route('/addresses', methods=['GET', 'POST'])
@jwt_required()
def manage_addresses():
    user_id = get_jwt_identity()
    if request.method == 'POST':
        data = request.get_json()
        new_address = Address(
            user_id=user_id,
            address_line=data.get('address_line'),
            city=data.get('city'),
            state=data.get('state'),
            pincode=data.get('pincode'),
            lat=data.get('lat'),
            lng=data.get('lng')
        )
        db.session.add(new_address)
        db.session.commit()
        return jsonify(new_address.to_dict()), 201
    
    addresses = Address.query.filter_by(user_id=user_id).all()
    return jsonify([a.to_dict() for a in addresses]), 200

@user_bp.route('/favorites', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def manage_favorites():
    user_id = get_jwt_identity()
    if request.method == 'POST':
        restaurant_id = request.get_json().get('restaurant_id')
        fav = Favorite(user_id=user_id, restaurant_id=restaurant_id)
        db.session.add(fav)
        db.session.commit()
        return jsonify({"msg": "Added to favorites"}), 201
    
    if request.method == 'DELETE':
        restaurant_id = request.args.get('restaurant_id')
        fav = Favorite.query.filter_by(user_id=user_id, restaurant_id=restaurant_id).first()
        if fav:
            db.session.delete(fav)
            db.session.commit()
        return jsonify({"msg": "Removed from favorites"}), 200

    favorites = Favorite.query.filter_by(user_id=user_id).all()
    restaurant_ids = [f.restaurant_id for f in favorites]
    restaurants = Restaurant.query.filter(Restaurant.id.in_(restaurant_ids)).all()
    return jsonify([r.to_dict() for r in restaurants]), 200
