from app import create_app, db
from app.models.user import User
from app.models.restaurant import Restaurant, MenuItem

def seed_data():
    app = create_app()
    with app.app_context():
        
        owner = User.query.filter_by(email="owner@zomathon.com").first()
        if not owner:
            owner = User(full_name="John Doe", email="owner@zomathon.com", phone="1234567890", role="owner")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

        spice_route_res = Restaurant.query.filter_by(name="The Spice Route").first()
        if not spice_route_res:
            spice_route_res = Restaurant(
                owner=owner,
                name="The Spice Route",
                description="Authentic Indian and Mughlai delicacies.",
                cuisine_type="Indian, Mughlai", # Initial cuisine type
                rating=4.5,
                avg_price=500,
                delivery_time="30-40 min",
                image_url="https://images.unsplash.com/photo-1565299624946-b28f40a04229?auto=format&fit=crop&w=800&q=80",
                address="Lower Parel, Mumbai",
                is_approved=True
            )
            db.session.add(spice_route_res)
            db.session.flush() # Flush to get ID for menu items
            
            db.session.add_all([
                MenuItem(restaurant_id=spice_route_res.id, name="Butter Chicken", price=450, category="Main Course", is_veg=False),
                MenuItem(restaurant_id=spice_route_res.id, name="Paneer Lababdar", price=380, category="Main Course"),
                MenuItem(restaurant_id=spice_route_res.id, name="Garlic Naan", price=90, category="Bread")
            ])
            print("The Spice Route restaurant added.")
        
        if spice_route_res.cuisine_type != "Indian, Mughlai, Thali":
            spice_route_res.cuisine_type = "Indian, Mughlai, Thali"
            db.session.add(spice_route_res) # Mark for update
            print("The Spice Route cuisine updated to include Thali.")


        if not Restaurant.query.filter_by(name="Pizza Palace").first():
            pizza_res = Restaurant(
                owner=owner,
                name="Pizza Palace",
                description="The best artisanal pizzas in town.",
                cuisine_type="Pizza, Italian",
                rating=4.8,
                avg_price=400,
                delivery_time="25-35 min",
                image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
                address="Colaba, Mumbai",
                is_approved=True
            )
            db.session.add(pizza_res)
            db.session.flush()
            
            db.session.add_all([
                MenuItem(restaurant_id=pizza_res.id, name="Margherita Pizza", price=299, category="Pizza", image_url="https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=400"),
                MenuItem(restaurant_id=pizza_res.id, name="Pepperoni Blast", price=449, category="Pizza", is_veg=False),
                MenuItem(restaurant_id=pizza_res.id, name="Garlic Breadsticks", price=149, category="Sides")
            ])

        if not Restaurant.query.filter_by(name="Burger Kingly").first():
            burger_res = Restaurant(
                owner=owner,
                name="Burger Kingly",
                description="Juicy burgers and crispy fries.",
                cuisine_type="Burger, Fast Food",
                rating=4.2,
                avg_price=300,
                delivery_time="20-30 min",
                image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
                address="Andheri West, Mumbai",
                is_approved=True
            )
            db.session.add(burger_res)
            db.session.flush()
            
            db.session.add_all([
                MenuItem(restaurant_id=burger_res.id, name="Classic Veggie Burger", price=199, category="Burger"),
                MenuItem(restaurant_id=burger_res.id, name="Double Cheese Chicken Burger", price=299, category="Burger", is_veg=False),
                MenuItem(restaurant_id=burger_res.id, name="Peri Peri Fries", price=129, category="Sides")
            ])

        if not Restaurant.query.filter_by(name="Royal Biryani House").first():
            biryani_res = Restaurant(
                owner=owner,
                name="Royal Biryani House",
                description="Fragrant biryanis cooked in traditional style.",
                cuisine_type="Biryani, North Indian",
                rating=4.6,
                avg_price=450,
                delivery_time="40-50 min",
                image_url="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800",
                address="Juhu, Mumbai",
                is_approved=True
            )
            db.session.add(biryani_res)
            db.session.flush()
            
            db.session.add_all([
                MenuItem(restaurant_id=biryani_res.id, name="Chicken Dum Biryani", price=380, category="Biryani", is_veg=False, image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400"),
                MenuItem(restaurant_id=biryani_res.id, name="Veg Hyderabadi Biryani", price=320, category="Biryani", image_url="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=400"),
                MenuItem(restaurant_id=biryani_res.id, name="Gulab Jamun (2 pcs)", price=80, category="Dessert", image_url="https://images.unsplash.com/photo-1593854123512-1f4a47568f6a?auto=format&fit=crop&w=400")
            ])

        if not Restaurant.query.filter_by(name="Sweet Treats Bakery").first():
            bake_res = Restaurant(
                owner=owner,
                name="Sweet Treats Bakery",
                description="Delicious cakes and pastries.",
                cuisine_type="Cake, Desserts",
                rating=4.7,
                avg_price=600,
                delivery_time="30-45 min",
                image_url="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
                address="Bandra West, Mumbai",
                is_approved=True
            )
            db.session.add(bake_res)
            db.session.flush()
            
            db.session.add_all([
                MenuItem(restaurant_id=bake_res.id, name="Chocolate Truffle Cake", price=550, category="Cake"),
                MenuItem(restaurant_id=bake_res.id, name="Red Velvet Pastry", price=150, category="Pastry"),
                MenuItem(restaurant_id=bake_res.id, name="Blueberry Cheesecake Slice", price=180, category="Pastry")
            ])

        if not Restaurant.query.filter_by(name="Rolls & Wraps").first():
            rolls_res = Restaurant(
                owner=owner,
                name="Rolls & Wraps",
                description="Delicious Kati rolls and wraps.",
                cuisine_type="Rolls, Fast Food",
                rating=4.4,
                avg_price=250,
                delivery_time="15-25 min",
                image_url="https://images.unsplash.com/photo-1544378730-8b5104b18790?w=800",
                address="Powai, Mumbai",
                is_approved=True
            )
            db.session.add(rolls_res)
            db.session.flush()
            
            db.session.add_all([
                MenuItem(restaurant_id=rolls_res.id, name="Double Egg Chicken Roll", price=180, category="Rolls", is_veg=False, image_url="https://images.unsplash.com/photo-1626700051175-656860749007?auto=format&fit=crop&w=400"),
                MenuItem(restaurant_id=rolls_res.id, name="Paneer Tikka Roll", price=160, category="Rolls", image_url="https://images.unsplash.com/photo-1512058560560-43e3a3467471?auto=format&fit=crop&w=400"),
                MenuItem(restaurant_id=rolls_res.id, name="Veg Hara Bhara Kebab", price=120, category="Starters", image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400")
            ])
            print("Rolls & Wraps restaurant added.")

        if not Restaurant.query.filter_by(name="Kathi Junction").first():
            kathi_res = Restaurant(
                owner=owner,
                name="Kathi Junction",
                description="The ultimate destination for authentic Kati rolls.",
                cuisine_type="Rolls, North Indian",
                rating=4.5,
                avg_price=200,
                delivery_time="15-20 min",
                image_url="https://images.unsplash.com/photo-1544378730-8b5104b18790?w=800",
                address="Malad West, Mumbai",
                is_approved=True
            )
            db.session.add(kathi_res)
            db.session.flush()
            
            db.session.add_all([
                MenuItem(restaurant_id=kathi_res.id, name="Malai Paneer Roll", price=140, category="Rolls", image_url="https://images.unsplash.com/photo-1510629708945-8f65e231019d?w=400"),
                MenuItem(restaurant_id=kathi_res.id, name="Double Chicken Egg Roll", price=170, category="Rolls", is_veg=False),
                MenuItem(restaurant_id=kathi_res.id, name="Masala Chai", price=40, category="Beverages")
            ])
            print("Kathi Junction restaurant added.")

        for name, url in [
            ("Pizza Palace", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"),
            ("Burger Kingly", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"),
            ("Royal Biryani House", "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800"),
            ("Sweet Treats Bakery", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800"),
            ("Rolls & Wraps", "https://images.unsplash.com/photo-1626700051175-656860749007?auto=format&fit=crop&w=800"),
            ("The Spice Route", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800")
        ]:
            r = Restaurant.query.filter_by(name=name).first()
            if r:
                r.image_url = url

        menu_updates = [
            ("Chicken Dum Biryani", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400"),
            ("Veg Hyderabadi Biryani", "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=400"),
            ("Gulab Jamun (2 pcs)", "https://images.unsplash.com/photo-1593854123512-1f4a47568f6a?auto=format&fit=crop&w=400"),
            ("Double Egg Chicken Roll", "https://images.unsplash.com/photo-1626700051175-656860749007?auto=format&fit=crop&w=400"),
            ("Paneer Tikka Roll", "https://images.unsplash.com/photo-1512058560560-43e3a3467471?auto=format&fit=crop&w=400")
        ]
        for name, url in menu_updates:
            m = MenuItem.query.filter_by(name=name).first()
            if m:
                m.image_url = url
                print(f"Updated image for menu item: {name}")

        db.session.commit()
        print("Additional data seeded and existing images updated successfully!")

if __name__ == "__main__":
    seed_data()
