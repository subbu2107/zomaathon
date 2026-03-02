import stripe
import os
from flask import Blueprint, request, jsonify
from server.app import db
from server.app.models.order import Order, Payment
from flask_jwt_extended import jwt_required, get_jwt_identity

payment_bp = Blueprint('payment', __name__)

stripe.api_key = os.getenv('STRIPE_API_KEY')

@payment_bp.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    try:
        data = request.get_json()
        order_id = data.get('order_id')
        order = Order.query.get_or_404(order_id)
        api_key = os.getenv('STRIPE_API_KEY', 'your_stripe_key')
        
        if api_key == 'your_stripe_key' or not api_key.startswith('sk_'):
            mock_session_id = f"mock_session_{order.id}"
            mock_url = f"http://localhost:5173/orders?success=true&session_id={mock_session_id}"
            
            payment = Payment(
                order_id=order.id,
                method='Online',
                amount=order.total_amount,
                transaction_id=mock_session_id,
                status='Pending'
            )
            db.session.add(payment)
            db.session.commit()
            
            return jsonify({'id': mock_session_id, 'url': mock_url})

        checkpoint_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'inr',
                    'product_data': {
                        'name': f'Order #{order.id} from Zomathon',
                    },
                    'unit_amount': int(order.total_amount * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:5173/orders?success=true',
            cancel_url='http://localhost:5173/cart?canceled=true',
        )
        
        payment = Payment(
            order_id=order.id,
            method='Online',
            amount=order.total_amount,
            transaction_id=checkpoint_session.id,
            status='Pending'
        )
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({'id': checkpoint_session.id, 'url': checkpoint_session.url})
    except Exception as e:
        return jsonify(error=str(e)), 500

@payment_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('STRIPE_SIGNATURE')
    
    return jsonify(success=True)
