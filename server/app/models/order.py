from server.app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum('Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'), default='Pending')
    payment_status = db.Column(db.Enum('Pending', 'Completed', 'Failed'), default='Pending')
    payment_method = db.Column(db.Enum('COD', 'Online'), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True)
    tracking = db.relationship('DeliveryTracking', backref='order', uselist=False, lazy=True)

    def to_dict(self):
        from server.app.models.restaurant import Restaurant # Local import to avoid circular dependency if needed, but Order usually knows Restaurant
        restaurant = Restaurant.query.get(self.restaurant_id)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "restaurant_id": self.restaurant_id,
            "restaurant_name": restaurant.name if restaurant else "Unknown",
            "restaurant_image": restaurant.image_url if restaurant else None,
            "total_amount": float(self.total_amount),
            "status": self.status,
            "payment_status": self.payment_status,
            "payment_method": self.payment_method,
            "address_id": self.address_id,
            "created_at": self.created_at.isoformat(),
            "items": [item.to_dict() for item in self.items]
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    menu_item = db.relationship('MenuItem', backref='order_items', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "menu_item_id": self.menu_item_id,
            "name": self.menu_item.name if self.menu_item else "Deleted Item",
            "quantity": self.quantity,
            "price": float(self.price)
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    transaction_id = db.Column(db.String(100), unique=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum('Pending', 'Success', 'Failed'), default='Pending')
    method = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DeliveryTracking(db.Model):
    __tablename__ = 'delivery_tracking'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    current_lat = db.Column(db.Numeric(10, 8))
    current_lng = db.Column(db.Numeric(11, 8))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
