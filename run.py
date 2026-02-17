from app import app, db

with app.app_context():
        db.create_all()
        # db.drop_all()

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)