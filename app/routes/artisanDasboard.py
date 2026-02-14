from app import app
from flask import render_template
from flask_login import login_user, current_user, logout_user, login_required


from app.models.user_model import Artisan


@app.route("/artisan-dashboard")
def artisan_dashboard_page():
    artisan = Artisan.query.filter_by(id=current_user.id).first()
    return render_template("artisan-dashboard.html", artisan=artisan)