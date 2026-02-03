from app import app
from flask import render_template


@app.route("/")
def landing_page():
    return render_template("index.html")

@app.route("/how-it-works")
def how_it_works_page():
    return render_template("index.html")

@app.route("/builders")
def builders_page():
    return render_template("index.html")

@app.route("/artisans")
def artisans_page():
    return render_template("index.html")

@app.route("/contact")
def contact_page():
    return render_template("index.html")
