from server.app import create_app, db
from server.app.models.user import User
from server.app.models.restaurant import Restaurant, MenuItem

def seed_data():
    app = create_app()
    with app.app_context():
        db.create_all()
        
        if User.query.filter_by(email="admin@zomathon.com").first():
            print("Database already seeded.")
            return

        owner = User(full_name="John Doe", email="owner@zomathon.com", phone="1234567890", role="owner")
        owner.set_password("password123")
        db.session.add(owner)
        
        res = Restaurant(
            owner=owner,
            name="The Spice Route",
            description="Authentic Indian Cuisines with a twist.",
            cuisine_type="Indian, Mughlai",
            rating=4.5,
            avg_price=500,
            delivery_time="30-40 min",
            image_url="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
            address="Bandstand, Mumbai",
            is_approved=True
        )
        db.session.add(res)
        
        db.session.flush() # Get res.id
        
        item1 = MenuItem(
            restaurant_id=res.id,
            name="Butter Chicken",
            description="Creamy tomato based curry with tender chicken pieces.",
            price=350,
            category="Main Course",
            is_veg=False
        )
        item2 = MenuItem(
            restaurant_id=res.id,
            name="Paneer Tikka",
            description="Marinated cottage cheese grilled to perfection.",
            price=280,
            category="Starters",
            is_veg=True
        )
        db.session.add_all([item1, item2])
        
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
