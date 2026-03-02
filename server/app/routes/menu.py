from flask import Blueprint, request, jsonify
from server.app import db
from server.app.models.restaurant import MenuItem
from server.app.middleware.auth import roles_required

menu_bp = Blueprint('menu', __name__)

@menu_bp.route('/<int:restaurant_id>', methods=['GET'])
def get_menu(restaurant_id):
    items = MenuItem.query.filter_by(restaurant_id=restaurant_id).all()
    return jsonify([i.to_dict() for i in items]), 200

@menu_bp.route('/', methods=['POST'])
@roles_required('owner', 'admin')
def add_menu_item():
    try:
        data = request.get_json()
        new_item = MenuItem(
            restaurant_id=data.get('restaurant_id'),
            name=data.get('name'),
            description=data.get('description'),
            price=data.get('price'),
            category=data.get('category'),
            image_url=data.get('image_url'),
            is_veg=data.get('is_veg', True)
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding menu item: {str(e)}")
        return jsonify({"msg": f"Failed to add item: {str(e)}"}), 500

@menu_bp.route('/<int:id>', methods=['DELETE'])
@roles_required('owner', 'admin')
def delete_menu_item(id):
    item = MenuItem.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Item deleted"}), 200
