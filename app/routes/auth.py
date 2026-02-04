from app import app
from flask import render_template


@app.route("/artisan-signup")
def artisan_signup_page():
    return render_template("artisan-signup.html")