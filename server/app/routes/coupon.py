from flask import Blueprint, request, jsonify
from server.app import db
from server.app.models.interactions import Coupon
from datetime import datetime

coupon_bp = Blueprint('coupon', __name__)

@coupon_bp.route('/', methods=['GET'])
def get_coupons():
    coupons = Coupon.query.filter(Coupon.expiry_date >= datetime.now().date(), Coupon.is_active == True).all()
    return jsonify([{
        "code": c.code,
        "discount": c.discount_percent,
        "min_order": float(c.min_order_value)
    } for c in coupons]), 200

@coupon_bp.route('/validate', methods=['POST'])
def validate_coupon():
    data = request.get_json()
    code = data.get('code')
    order_value = data.get('order_value')
    
    coupon = Coupon.query.filter_by(code=code).first()
    if not coupon:
        return jsonify({"msg": "Invalid coupon code"}), 400
    
    if not coupon.is_active or coupon.expiry_date < datetime.now().date():
        return jsonify({"msg": "Coupon expired"}), 400
        
    if order_value < coupon.min_order_value:
        return jsonify({"msg": f"Minimum order value of ₹{coupon.min_order_value} required"}), 400
        
    return jsonify({
        "discount_percent": coupon.discount_percent,
        "msg": "Coupon applied successfully"
    }), 200
