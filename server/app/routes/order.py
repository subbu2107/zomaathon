from flask import Blueprint, request, jsonify
from server.app import db, socketio
from server.app.models.order import Order, OrderItem
from server.app.models.restaurant import MenuItem
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.app.middleware.auth import roles_required

order_bp = Blueprint('order', __name__)

@order_bp.route('/', methods=['POST'])
@jwt_required()
def place_order():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    new_order = Order(
        user_id=user_id,
        restaurant_id=data.get('restaurant_id'),
        total_amount=data.get('total_amount'),
        payment_method=data.get('payment_method'),
        address_id=data.get('address_id'),
        status='Pending'
    )
    
    db.session.add(new_order)
    db.session.flush() # Get order ID before committing items
    
    for item in data.get('items'):
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=item['id'],
            quantity=item['quantity'],
            price=item['price']
        )
        db.session.add(order_item)
    
    db.session.commit()
    
    socketio.emit('new_order', new_order.to_dict(), room=f"restaurant_{new_order.restaurant_id}")
    print(f"Emitted new_order for restaurant_{new_order.restaurant_id}")
    
    return jsonify(new_order.to_dict()), 201

@order_bp.route('/history', methods=['GET'])
@jwt_required()
def order_history():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200

@order_bp.route('/<int:id>/status', methods=['PUT'])
@roles_required('owner', 'admin')
def update_order_status(id):
    data = request.get_json()
    order = Order.query.get_or_404(id)
    order.status = data.get('status')
    db.session.commit()
    
    socketio.emit('order_status_update', {"order_id": order.id, "status": order.status}, room=f"user_{order.user_id}")
    
    return jsonify(order.to_dict()), 200

@order_bp.route('/restaurant/<int:restaurant_id>', methods=['GET'])
@roles_required('owner', 'admin')
def restaurant_orders(restaurant_id):
    from server.app.models.restaurant import Restaurant
    user_id = get_jwt_identity()
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    
    if restaurant.owner_id != int(user_id):
        return jsonify({"msg": "Unauthorized access to these orders"}), 403
        
    orders = Order.query.filter_by(restaurant_id=restaurant_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200
