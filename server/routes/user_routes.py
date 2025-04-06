import os
import bcrypt
import logging
from flask import Flask, Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

from server.config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS  # ✅ Import from config.py
from datetime import datetime
from server.app_oop import FoodQuestDB
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from server.extensions import mysql

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app = Flask(__name__)

# ✅ Define the Blueprint
user_routes = Blueprint("user_routes", __name__)
CORS(user_routes)
db = FoodQuestDB(mysql)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
app.config['UPLOAD_FOLDER'] = "server/uploads/profile_pictures"
def allowed_file(filename):
    """Check if the file type is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_json(required_fields):
    data = request.get_json()
    if not data:
        return {"error": "No input data provided"}, 400
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return {"error": f"Missing fields: {', '.join(missing_fields)}"}, 400
    
    return data, 200


@user_routes.route("/health", methods=["GET"])
def api_root():
    return jsonify({"message": "API is running"}), 200




@user_routes.route('/upload-profile', methods=['POST'])
def upload_profile():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    if file:
        # Save the file to the uploads folder
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        # Update the profile picture URL in the database
        user_id = get_logged_in_user_id()  # Example function to get the logged-in user ID
        db.update_profile_picture(user_id, filename)

        return jsonify({"message": "Profile picture updated", "file_url": f"{app.config['UPLOAD_URL']}/{filename}"}), 200

# ---------------------- Profile Picture Upload ----------------------
@user_routes.route("/user/upload-profile-picture/<int:user_id>", methods=["POST"])
def upload_profile_picture(user_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Ensure the upload directory exists
        
        # Secure the filename
        filename = secure_filename(f"user_{user_id}_{file.filename}")
        upload_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads", "profile_pictures"))
        filepath = os.path.join(upload_folder, filename)


        # Save the file
        file.save(filepath)

        # Debugging: Check if file is saved
        print(f"Saved file: {filepath}")
        print("Files in directory:", os.listdir(UPLOAD_FOLDER))

        # Generate URL for the file
        file_url = f"http://127.0.0.1:5000/uploads/profile_pictures/{filename}"

        
        # Update database with the file URL
        update_result = db.update_profile_picture(user_id, file_url)

        if update_result.get("status") == "success":
            return jsonify({"message": "Profile picture updated!", "profile_picture": file_url})
        else:
            return jsonify({"error": "Database update failed", "details": update_result}), 500
    else:
        return jsonify({"error": "Invalid file format"}), 400
    
@user_routes.route('/uploads/profile_pictures/<filename>')
def uploaded_file(filename):
    upload_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads", "profile_pictures"))
    
    # Debugging
    print("🛠 Looking for file in:", upload_folder)
    print("📂 Files present:", os.listdir(upload_folder))
    
    try:
        return send_from_directory(upload_folder, filename)
    except Exception as e:
        print("❌ Error sending file:", str(e))
        return jsonify({"error": "File not found"}), 404


@user_routes.route("/user/profile/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    """Fetch user profile from MySQL"""
    try:
        cursor = mysql.connection.cursor()
        query = "SELECT user_id, full_name, email, role, phone_number, address, profile_picture, created_at FROM users WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()  # ✅ Fetch user data
        cursor.close()

        if not user:
            return jsonify({"error": "User not found"}), 404
        profile_picture_url = f"http://127.0.0.1:5000/{user[6]}" if user[6] else None

        # Convert to JSON format
        user_data = {
            "user_id": user[0],
            "full_name": user[1],
            "email": user[2],
            "role": user[3],
            "phone_number": user[4],
            "address": user[5],
            "profile_picture": profile_picture_url,
            "created_at": user[7].strftime("%Y-%m-%d %H:%M:%S") if user[7] else None,
        }

        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@user_routes.route("/users", methods=["GET"])
def get_users():
    result = db.get_all_users()
    return jsonify(result), 200
  
@user_routes.route("/user/register", methods=["POST"])
def register_user():
    logging.info("Received registration request")
    required_fields = ["full_name", "email", "phone_number", "address", "password", "confirm_password", "role"]
    data, status_code = validate_json(required_fields)

    if status_code != 200:
        return jsonify(data), status_code

    if data["password"] != data["confirm_password"]:
        return jsonify({"error": "Passwords do not match"}), 400

    hashed_password = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    data["password"] = hashed_password
    del data["confirm_password"]

    try:
        cursor = mysql.connection.cursor()
        query = """
        INSERT INTO users (full_name, email, phone_number, address, password, role, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (
            data["full_name"], data["email"], data["phone_number"], 
            data["address"], data["password"], data["role"]
        ))
        mysql.connection.commit()
        logging.info("✅ User registration committed to database")
        cursor.close()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        logging.error(f"Error during registration: {str(e)}")
        return jsonify({"error": "Failed to register user"}), 500



@user_routes.route("/user/login", methods=["POST"])
def login():
    required_fields = ["email", "password"]
    data, status_code = validate_json(required_fields)

    if status_code != 200:
        return jsonify(data), status_code

    user = db.get_user_by_email(data["email"])
    
    print("🔍 User fetched from DB:", user)  # ✅ Debugging step

    if not user or not user.get("password"):
        print("❌ User not found or missing password")
        return jsonify({"error": "Invalid credentials"}), 401

    print("🔍 Checking password...")
    if not bcrypt.checkpw(data["password"].encode(), user["password"].encode()):
        print("❌ Incorrect password")
        return jsonify({"error": "Invalid credentials"}), 401

    print("✅ Login successful")
    return jsonify({"message": "Login successful", "user_id": user["user_id"], "role": user["role"]})

@user_routes.route("/user/update/<int:user_id>", methods=["PUT"])
def update_user_profile(user_id):
    """Update user profile information."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        allowed_fields = ["full_name", "email", "phone_number", "address", "role"]
        update_fields = {key: data[key] for key in data if key in allowed_fields}

        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400

        set_clause = ", ".join(f"{key} = %s" for key in update_fields.keys())
        values = list(update_fields.values()) + [user_id]

        query = f"UPDATE users SET {set_clause} WHERE user_id = %s"

        cursor = mysql.connection.cursor()
        cursor.execute(query, values)
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "User profile updated successfully"}), 200

    except Exception as e:
        logging.error(f"Error updating profile: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500