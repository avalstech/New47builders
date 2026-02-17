from flask import Flask
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy 
from flask_login import LoginManager

import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__) 

app.config["SECRET_KEY"] = "3456789olr6789ijhy78ikmnyokgyui"
# app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///47builder.db"
# app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:test123@localhost:5432/47builderDB"
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:test123@16.171.255.116:5432/47builderDB"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

bcrypt = Bcrypt(app)
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'landing_page'
login_manager.login_message_category = 'info'

from app.routes import home, auth, artisanDasboard
