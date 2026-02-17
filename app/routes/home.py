from app import app
from flask import render_template, url_for

from app.models.user_model import Artisan


@app.route("/")
def landing_page():
    artisan = Artisan.query.filter_by(feactured=True).limit(3).all()
    return render_template("index.html", artisan=artisan)

@app.route("/how-it-works")
def how_it_works_page():
    return render_template("how-it-work.html")

@app.route("/builders")
def builders_page():
    return render_template("builders.html")

@app.route("/artisans")
def artisans_page():
    artisan = Artisan.query.all()
    count = Artisan.query.count()
    return render_template("artisans.html", artisan=artisan, count=count)

@app.route("/contact")
def contact_page():
    return render_template("contact.html")
