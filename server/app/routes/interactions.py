from flask import Blueprint, request, jsonify
from server.app import db
from server.app.models.interactions import Review
from server.app.models.restaurant import Restaurant
from flask_jwt_extended import jwt_required, get_jwt_identity

interaction_bp = Blueprint('interaction', __name__)

@interaction_bp.route('/reviews', methods=['POST'])
@jwt_required()
def add_review():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    new_review = Review(
        user_id=user_id,
        restaurant_id=data.get('restaurant_id'),
        rating=data.get('rating'),
        comment=data.get('comment')
    )
    
    restaurant = Restaurant.query.get(data.get('restaurant_id'))
    reviews = Review.query.filter_by(restaurant_id=restaurant.id).all()
    total_rating = sum([r.rating for r in reviews]) + data.get('rating')
    restaurant.rating = total_rating / (len(reviews) + 1)
    
    db.session.add(new_review)
    db.session.commit()
    
    return jsonify({"msg": "Review added"}), 201

@interaction_bp.route('/reviews/<int:restaurant_id>', methods=['GET'])
def get_reviews(restaurant_id):
    reviews = Review.query.filter_by(restaurant_id=restaurant_id).all()
    return jsonify([{
        "id": r.id,
        "rating": r.rating,
        "comment": r.comment,
        "user_id": r.user_id,
        "created_at": r.created_at.isoformat()
    } for r in reviews]), 200
