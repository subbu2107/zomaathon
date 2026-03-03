from server.app import db, bcrypt
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.Enum('user', 'owner', 'admin'), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    addresses = db.relationship('Address', backref='user', lazy=True)
    restaurants = db.relationship('Restaurant', backref='owner', lazy=True)
    orders = db.relationship('Order', backref='customer', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)
    favorites = db.relationship('Favorite', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }

class Address(db.Model):
    __tablename__ = 'addresses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    address_line = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    pincode = db.Column(db.String(10))
    lat = db.Column(db.Numeric(10, 8))
    lng = db.Column(db.Numeric(11, 8))
    is_default = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "address_line": self.address_line,
            "city": self.city,
            "state": self.state,
            "pincode": self.pincode,
            "lat": float(self.lat) if self.lat else None,
            "lng": float(self.lng) if self.lng else None,
            "is_default": self.is_default
        }
