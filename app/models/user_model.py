from datetime import datetime
from app import db, login_manager
from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import JSON



@login_manager.user_loader
def load_artisan(artisan_id):
    return Artisan.query.get(artisan_id)

class Artisan(db.Model, UserMixin):
    __tablename__ = 'artisan'
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(50), unique=False, nullable=False)
    lastName = db.Column(db.String(50), unique=False, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    businessName = db.Column(db.String(50), unique=False, nullable=False)
    location = db.Column(db.String(100), unique=False, nullable=False)
    primaryTrade = db.Column(db.String(100), unique=False, nullable=False)
    experienceYears = db.Column(db.String(100), unique=False, nullable=False)
    ninOrId = db.Column(db.String(100), unique=False, nullable=False)
    referralCode = db.Column(db.String(100), unique=False, nullable=False)
    portfolioLink = db.Column(db.String(100), unique=False, nullable=False)
    about = db.Column(db.String(100), unique=False, nullable=False)
    phone = db.Column(db.String(100), unique=False, nullable=False)
    password = db.Column(db.String(300), nullable=False)
    gender = db.Column(db.String(50))
    profile_img = db.Column(db.String(50), nullable=False, default= "defaults.png" )
    is_admin = db.Column(db.Boolean, default=False)
    feactured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    

    def __repr__(self):
        return f"Artisan_{self.id}('{self.primaryTrade}','{self.about}','{self.phone}','{self.experienceYears}','{self.ninOrId}','{self.referralCode}','{self.portfolioLink}','{self.firstName}', '{self.lastName}', '{self.email}', '{self.businessName}', '{self.location}', '{self.gender}', '{self.created_at}', '{self.is_admin}', '{self.profile_img}')"
