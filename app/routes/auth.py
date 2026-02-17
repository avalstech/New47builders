from app import app, bcrypt, db
from flask import render_template, redirect, url_for, flash, request, current_app
from ..models.user_model import Artisan
from flask_login import login_user, current_user, logout_user, login_required
import secrets, os, json
from dotenv import load_dotenv
load_dotenv()

def save_pics(form_pics):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_pics.filename)
    path_ext = 'artisan/profile_pics/'
    pics_fn = random_hex + f_ext
    pics_path = os.path.join(current_app.root_path, 'static', path_ext, pics_fn)
    # Ensure the directory exists
    os.makedirs(os.path.dirname(pics_path), exist_ok=True)
    form_pics.save(pics_path)
    return pics_fn

def delete_image(image_filename):
    if image_filename:  # Check if the image filename is not None or empty
        image_path = os.path.join(app.root_path, 'static/artisan/profile_pics/', image_filename)
        
        if os.path.exists(image_path):
            os.remove(image_path)
            return True
    return False


@app.route("/artisan-signup",  methods=['GET', 'POST'])
def artisan_signup_page():
    if current_user.is_authenticated:
        return redirect(url_for('artisan_dashboard_page'))
    
    email = request.form.get('email')
    firstName = request.form.get('firstName')
    lastName = request.form.get('lastName')
    businessName = request.form.get('businessName')
    location = request.form.get('location')
    primaryTrade = request.form.get('primaryTrade')
    experienceYears = request.form.get('experienceYears')
    ninOrId =  request.form.get('ninOrId')
    referralCode = request.form.get('referralCode')
    portfolioLink = request.form.get('portfolioLink')
    about = request.form.get('about')
    phone = request.form.get('phone')
    password = request.form.get('password')
    confirmPassword = request.form.get('confirmPassword')
    gender = request.form.get('gender')
    profile_img = request.files.get("profile")

    artisan = Artisan.query.filter_by(email=email).first()

    if artisan:
        flash("Email already exists. Please choose a different one.", "danger")
        return redirect(url_for('artisan_signup_page'))
    
    if password != confirmPassword:
        flash("Passwords do not match", "danger")
        return redirect(url_for('artisan_signup_page'))
    
    if request.method == 'POST':
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        if profile_img:
            pics_file = save_pics(profile_img)
        else:
            pics_file = None  

        artisanData = Artisan(
            email = email,
            firstName = firstName,
            lastName = lastName,
            businessName = businessName,
            location = location,
            primaryTrade = primaryTrade,
            experienceYears = experienceYears,
            ninOrId =  ninOrId,
            referralCode = referralCode,
            portfolioLink = portfolioLink,
            about = about,
            phone = phone,
            gender= gender,
            password = hashed_password,
            profile_img = pics_file
        )
        db.session.add(artisanData)
        db.session.commit()

        flash("Account created successfully, Please login....", "success")
        return redirect(url_for('artisan_login_page'))
    return render_template("artisan-signup.html")


@app.route("/artisan-login", methods=["POST", "GET"])
def artisan_login_page():
    if current_user.is_authenticated:
        return redirect(url_for('artisan_dashboard_page'))
    
    email = request.form.get('email')
    password = request.form.get('password')
    rememberMe = request.form.get('rememberMe')

    if request.method == 'POST':
        artisan = Artisan.query.filter_by(email=email).first()

        if artisan:
            check_password = bcrypt.check_password_hash(artisan.password, password)
            if check_password:
                login_user(artisan, rememberMe)
                next_page = request.args.get('next')

                if next_page:
                    return redirect(next_page)
                else:
                    flash(f'You have successfully Logged In', 'success')
                    return redirect(url_for('artisan_dashboard_page'))
            else:
                flash('Invalid Password', 'danger')
        else:
            flash('No account found with that email', 'danger')

    return render_template("artisan-login.html")


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Logged out Successfully", 'success')
    return redirect(url_for("artisan_login_page"))