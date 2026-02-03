from app import app
from flask import render_template


@app.route("/")
def landing_page():
    return render_template("index.html")
