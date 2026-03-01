from flask import Blueprint, request, jsonify
from app import db
from app.models.restaurant import Restaurant
from app.models.order import Order
from app.middleware.auth import roles_required
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy import func

restaurant_bp = Blueprint('restaurant', __name__)

@restaurant_bp.route('/', methods=['GET'])
def get_restaurants():
    cuisine = request.args.get('cuisine')
    search = request.args.get('search')
    min_rating = request.args.get('rating', type=float)
    max_price = request.args.get('price', type=float)
    is_veg = request.args.get('is_veg', type=bool)
    
    query = Restaurant.query.filter_by(is_approved=True)
    
    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    if search:
        query = query.filter(Restaurant.name.ilike(f"%{search}%"))
    if min_rating:
        query = query.filter(Restaurant.rating >= min_rating)
    if max_price:
        query = query.filter(Restaurant.avg_price <= max_price)
    # Note: is_veg filtering usually applies to menu items, but can be a restaurant tag
    
    restaurants = query.all()
    return jsonify([r.to_dict() for r in restaurants]), 200


@restaurant_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()
    
    recommended_ids = []
    
    if user_id:
        # 1. Personalization: Find most ordered cuisines for this user
        top_cuisines = db.session.query(Restaurant.cuisine_type) \
            .join(Order, Order.restaurant_id == Restaurant.id) \
            .filter(Order.user_id == user_id) \
            .group_by(Restaurant.cuisine_type) \
            .order_by(db.func.count(Order.id).desc()) \
            .limit(2).all()
        
        if top_cuisines:
            cuisines = [c[0] for c in top_cuisines]
            # Find highly rated restaurants with these cuisines (excluding ones user already ordered from recently if possible)
            personal_picks = Restaurant.query.filter(
                Restaurant.is_approved == True,
                Restaurant.cuisine_type.in_(cuisines)
            ).order_by(Restaurant.rating.desc()).limit(5).all()
            
            if personal_picks:
                return jsonify([r.to_dict() for r in personal_picks]), 200

    # 2. General Fallback: Top 5 rated restaurants globally
    restaurants = Restaurant.query.filter_by(is_approved=True) \
        .order_by(Restaurant.rating.desc()) \
        .limit(5).all()
    
    return jsonify([r.to_dict() for r in restaurants]), 200

@restaurant_bp.route('/<int:id>', methods=['GET'])
def get_restaurant_details(id):
    restaurant = Restaurant.query.get_or_404(id)
    menu_items = [item.to_dict() for item in restaurant.menu_items]
    data = restaurant.to_dict()
    data['menu'] = menu_items
    return jsonify(data), 200

@restaurant_bp.route('/', methods=['POST'])
@roles_required('owner', 'admin')
def create_restaurant():
    data = request.get_json()
    owner_id = get_jwt_identity()
    
    new_restaurant = Restaurant(
        owner_id=owner_id,
        name=data.get('name'),
        description=data.get('description'),
        cuisine_type=data.get('cuisine_type'),
        avg_price=data.get('avg_price'),
        delivery_time=data.get('delivery_time'),
        image_url=data.get('image_url'),
        address=data.get('address')
    )
    
    db.session.add(new_restaurant)
    db.session.commit()
    return jsonify(new_restaurant.to_dict()), 201
