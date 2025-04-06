import os
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from server.config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
from server.app_oop import FoodQuestDB  # ✅ Import FoodQuestDB
from server.extensions import mysql  # ✅ Import `mysql` to pass into `db`

# Create Blueprint
upload_routes = Blueprint("upload_routes", __name__)

# Initialize Database Wrapper
db = FoodQuestDB(mysql)  # ✅ Use `db` instead of raw `mysql`

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_routes.route('/user/profile_picture', methods=['POST'])
def upload_profile_picture():
    """Upload and update a user's profile picture."""
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400

    file = request.files['file']
    user_id = request.form.get("user_id")

    if not user_id:
        return jsonify({"status": "error", "message": "User ID is required"}), 400

    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Ensure the upload directory exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # Secure filename and save file
        filename = secure_filename(f"user_{user_id}_{file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Store relative path in the database
        relative_path = f"/uploads/profile_pictures/{filename}"
        update_result = db.update_profile_picture(user_id, relative_path)  # ✅ Use `db`

        if update_result.get("status") == "success":
            return jsonify({"status": "success", "message": "Profile picture updated", "file_path": relative_path}), 200
        else:
            return jsonify({"status": "error", "message": "Database update failed", "details": update_result}), 500

    return jsonify({"status": "error", "message": "Invalid file type"}), 400
