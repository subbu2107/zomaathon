from server.app import db
from datetime import datetime

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    cuisine_type = db.Column(db.String(100))
    rating = db.Column(db.Numeric(2, 1), default=0.0)
    avg_price = db.Column(db.Numeric(10, 2))
    delivery_time = db.Column(db.String(20))
    image_url = db.Column(db.String(255))
    address = db.Column(db.String(255))
    lat = db.Column(db.Numeric(10, 8))
    lng = db.Column(db.Numeric(11, 8))
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    menu_items = db.relationship('MenuItem', backref='restaurant', lazy=True)
    orders = db.relationship('Order', backref='restaurant', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "owner_id": self.owner_id,
            "name": self.name,
            "description": self.description,
            "cuisine_type": self.cuisine_type,
            "rating": float(self.rating),
            "avg_price": float(self.avg_price),
            "delivery_time": self.delivery_time,
            "image_url": self.image_url,
            "address": self.address,
            "lat": float(self.lat) if self.lat else None,
            "lng": float(self.lng) if self.lng else None,
            "is_approved": self.is_approved,
            "menu": [item.to_dict() for item in self.menu_items]
        }

class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(100))
    image_url = db.Column(db.String(255))
    is_veg = db.Column(db.Boolean, default=True)
    is_available = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "restaurant_id": self.restaurant_id,
            "name": self.name,
            "description": self.description,
            "price": float(self.price),
            "category": self.category,
            "image_url": self.image_url,
            "is_veg": self.is_veg,
            "is_available": self.is_available
        }
