import math
from flask import Blueprint, request, jsonify
from server.app import db
from server.app.models.restaurant import Restaurant, MenuItem
from server.app.models.order import Order
from server.app.models.user import Address
from server.app.middleware.auth import roles_required
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy import func, or_

restaurant_bp = Blueprint('restaurant', __name__)

@restaurant_bp.route('/', methods=['GET'])
def get_restaurants():
    cuisine = request.args.get('cuisine')
    search = request.args.get('search')
    min_rating = request.args.get('rating', type=float)
    max_price = request.args.get('price', type=float)
    is_veg = request.args.get('is_veg', type=bool)
    
    query = Restaurant.query.filter_by(is_approved=True).outerjoin(MenuItem)
    
    if cuisine:
        query = query.filter(or_(
            Restaurant.cuisine_type.ilike(f"%{cuisine}%"),
            MenuItem.category.ilike(f"%{cuisine}%")
        ))
    if search:
        query = query.filter(or_(
            Restaurant.name.ilike(f"%{search}%"),
            Restaurant.description.ilike(f"%{search}%"),
            Restaurant.cuisine_type.ilike(f"%{search}%"),
            MenuItem.name.ilike(f"%{search}%"),
            MenuItem.description.ilike(f"%{search}%")
        ))
    if min_rating:
        query = query.filter(Restaurant.rating >= min_rating)
    if max_price:
        query = query.filter(Restaurant.avg_price <= max_price)
    
    restaurants = query.distinct().all()
    return jsonify([r.to_dict() for r in restaurants]), 200

@restaurant_bp.route('/feed', methods=['GET'])
def get_feed():
    new_restaurants = Restaurant.query.filter_by(is_approved=True).order_by(Restaurant.created_at.desc()).limit(10).all()
    new_items = MenuItem.query.join(Restaurant).filter(Restaurant.is_approved==True).order_by(MenuItem.id.desc()).limit(10).all()
    
    return jsonify({
        "new_restaurants": [r.to_dict() for r in new_restaurants],
        "new_items": [i.to_dict() for i in new_items]
    }), 200

@restaurant_bp.route('/my', methods=['GET'])
@roles_required('owner', 'admin')
def get_my_restaurants():
    from flask_jwt_extended import get_jwt_identity
    owner_id = get_jwt_identity()
    restaurants = Restaurant.query.filter_by(owner_id=owner_id).all()
    return jsonify([r.to_dict() for r in restaurants]), 200


def calculate_distance(lat1, lon1, lat2, lon2):
    if not lat1 or not lon1 or not lat2 or not lon2:
        return float('inf')
    dlat = float(lat1) - float(lat2)
    dlon = float(lon1) - float(lon2)
    return math.sqrt(dlat*dlat + dlon*dlon)

@restaurant_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()
    
    user_lat = request.args.get('lat', type=float)
    user_lng = request.args.get('lng', type=float)
    
    if not user_lat and user_id:
        default_addr = Address.query.filter_by(user_id=user_id, is_default=True).first()
        if default_addr:
            user_lat = float(default_addr.lat)
            user_lng = float(default_addr.lng)

    preferred_cuisines = {}
    ordered_restaurant_ids = {}
    favorite_ids = set()

    if user_id:
        orders = Order.query.filter_by(user_id=user_id).all()
        for o in orders:
            ordered_restaurant_ids[o.restaurant_id] = ordered_restaurant_ids.get(o.restaurant_id, 0) + 1
            r = Restaurant.query.get(o.restaurant_id)
            if r and r.cuisine_type:
                types = [c.strip().lower() for c in r.cuisine_type.split(',')]
                for t in types:
                    preferred_cuisines[t] = preferred_cuisines.get(t, 0) + 1
        
        from server.app.models.interactions import Favorite
        favs = Favorite.query.filter_by(user_id=user_id).all()
        favorite_ids = {f.restaurant_id for f in favs}

    query = Restaurant.query.filter_by(is_approved=True)
    restaurants = query.all()
    
    def scoring_function(r):
        reasons = []
        
        dist = calculate_distance(user_lat, user_lng, r.lat, r.lng)
        proximity_score = 2.0 / (1.0 + dist) if dist != float('inf') else 0
        if dist != float('inf') and dist < 0.05: # Roughly within 5km in this simplified calc
            reasons.append("Near you")

        rating_score = (float(r.rating) / 5.0) * 1.5
        if float(r.rating) >= 4.5:
            reasons.append("Top Rated")

        cuisine_score = 0
        cuisine_match = False
        if r.cuisine_type:
            types = [c.strip().lower() for c in r.cuisine_type.split(',')]
            for t in types:
                if t in preferred_cuisines:
                    cuisine_score += (preferred_cuisines[t] / max(preferred_cuisines.values(), default=1))
                    cuisine_match = True
            cuisine_score = min(cuisine_score, 1.0)
            if cuisine_match:
                reasons.append(f"Matches your taste in {r.cuisine_type.split(',')[0]}")

        history_score = 0.5 if r.id in ordered_restaurant_ids else 0
        if r.id in ordered_restaurant_ids:
            reasons.append("Ordered before")
            history_score += min(ordered_restaurant_ids[r.id] * 0.1, 0.5)

        fav_score = 1.0 if r.id in favorite_ids else 0
        if r.id in favorite_ids:
            reasons.append("In your favorites")

        total_score = proximity_score + rating_score + cuisine_score + history_score + fav_score
        
        primary_reason = reasons[0] if reasons else "Popular Choice"
        if fav_score > 0: primary_reason = "From your favorites"
        elif history_score > 0.5: primary_reason = "One of your frequent spots"
        elif cuisine_score > 0.7: primary_reason = f"Perfect for your {r.cuisine_type.split(',')[0]} cravings"
        
        return total_score, primary_reason

    scored_restaurants = []
    for r in restaurants:
        score, reason = scoring_function(r)
        d = r.to_dict()
        d['recommendation_reason'] = reason
        scored_restaurants.append((score, d))

    sorted_restaurants = [item[1] for item in sorted(scored_restaurants, key=lambda x: x[0], reverse=True)]
    return jsonify(sorted_restaurants[:15]), 200

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
        address=data.get('address'),
        lat=data.get('lat'),
        lng=data.get('lng'),
        is_approved=data.get('is_approved', True)
    )
    
    db.session.add(new_restaurant)
    db.session.commit()
    return jsonify(new_restaurant.to_dict()), 201
