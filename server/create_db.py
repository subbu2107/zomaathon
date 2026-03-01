from app import create_app, db
import os

app = create_app()

with app.app_context():
    # This will create the sqlite file and all tables based on the models
    db.create_all()
    print("Database created successfully!")
