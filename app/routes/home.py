from app import app
from flask import render_template


@app.route("/")
def landing_page():
    return render_template("index.html")

@app.route("/how-it-works")
def how_it_works_page():
    return render_template("how-it-work.html")

@app.route("/builders")
def builders_page():
    return render_template("builders.html")

@app.route("/artisans")
def artisans_page():
    return render_template("artisans.html")

@app.route("/contact")
def contact_page():
    return render_template("contact.html")

@app.route("/start-project")
def start_project_page():
    return render_template("start-project.html")
