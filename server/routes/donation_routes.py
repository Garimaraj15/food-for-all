from flask import Blueprint, request, jsonify, Flask, send_file
from server.app_oop import FoodQuestDB  # Use the FoodQuestDB class for database interaction
from server.extensions import mysql
from werkzeug.utils import secure_filename
import MySQLdb.cursors 
import logging
import os
from flask_uploads import UploadSet, configure_uploads, IMAGES
from server.config import DONATION_UPLOAD_FOLDER
from datetime import timedelta, datetime
from flask_cors import CORS
import json
import requests
from dotenv import load_dotenv
# Create Blueprint for donation-related routes
load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

donation_routes = Blueprint("donation_routes", __name__)
CORS(donation_routes)
# Initialize the database wrapper
db = FoodQuestDB(mysql)
app = Flask(__name__)

# Configure Flask-Uploads for image handling
photos = UploadSet('photos', IMAGES)
app.config['UPLOADED_PHOTOS_DEST'] = 'server/uploads/donation_images'  # Path where images are saved
configure_uploads(app, photos)
DONATION_FOLDER = os.path.join(DONATION_UPLOAD_FOLDER, "donations")
os.makedirs(DONATION_FOLDER, exist_ok=True)

def get_lat_lng_from_address(address):
    """ Fetch latitude & longitude from Google Maps API """
    url = f"https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": GOOGLE_MAPS_API_KEY}
    
    response = requests.get(url, params=params)
    data = response.json()

    if data["status"] == "OK":
        location = data["results"][0]["geometry"]["location"]
        return location["lat"], location["lng"]
    
    return None, None

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def convert_boolean(value):
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, str):
        return 1 if value.lower() in ['true', '1', 'yes'] else 0
    return 0


import json  # Ensure JSON is imported

@donation_routes.route("/health", methods=["GET"])
def api_root():
    return jsonify({"message": "API is running"}), 200



@donation_routes.route('/create', methods=['POST'])
def create_donation_route():
    user_id = request.form.get('user_id')
    category_id = request.form.get('category_id')
    food_name = request.form.get('food_name')
    description = request.form.get('description')
    quantity = request.form.get('quantity')
    nutrients = request.form.get('nutrients')
    expiry_date_raw = request.form.get('expiry_date')
    try:
        expiry_date = datetime.strptime(expiry_date_raw.strip('"'), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid expiry_date format. Expected YYYY-MM-DD"}), 400
    allowed_statuses = ['available', 'claimed', 'expired']
    status = request.form.get('status', 'available').lower()

    if status not in allowed_statuses:
            return jsonify({"error": f"Invalid status value. Must be one of {allowed_statuses}"}), 400

    pickup_address = request.form.get('pickup_address')
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    if not latitude or not longitude:
        latitude, longitude = get_lat_lng_from_address(pickup_address)
        if not latitude or not longitude:
            return jsonify({"error": "Could not fetch location data. Check your Google Maps API key."}), 400

    pickup_from = request.form.get('pickup_from')
    pickup_to = request.form.get('pickup_to')
    pickup_days = request.form.get('pickup_days', '{}')  # ✅ Default to empty JSON string
    contact_preference = request.form.get('contact_preference')
    additional_notes = request.form.get('additional_notes')
    safety_confirmed = convert_boolean(request.form.get('safety_confirmed'))
    share_contact_details = convert_boolean(request.form.get('share_contact_details'))

    # Handle photo upload
    photo_url = None
    if 'photo' in request.files:
        photo = request.files.get('photo')
        filename = secure_filename(f"donation_{user_id}_{photo.filename}")
        photo_path = os.path.join(app.config['UPLOADED_PHOTOS_DEST'], filename)
        photo.save(photo_path)
        photo_url = f"http://127.0.0.1:5000/api/donations/uploads/donation_images/{filename}"
    # Validate required fields
    if not user_id or not food_name or not quantity or not expiry_date:
        return jsonify({"error": "Missing required fields"}), 400

    # Convert pickup_days JSON string to a Python dictionary
    try:
        pickup_days = json.loads(pickup_days)  # ✅ Ensure it's always a valid JSON object
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid pickup_days format, should be a valid JSON string"}), 400

    # Call database function
    result, status_code = db.create_donation(
        user_id, category_id, food_name, description, quantity, nutrients, expiry_date, status,
        pickup_address, latitude, longitude, pickup_from, pickup_to, pickup_days, contact_preference,
        additional_notes, safety_confirmed, share_contact_details, photo
    )

    return jsonify(result), status_code



@donation_routes.route('/all', methods=['GET'])
def get_all_donations():
    try:
        donations = db.get_all_donations()
        return jsonify(donations) if donations else jsonify({"message": "No donations found"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@donation_routes.route('/<int:donation_id>', methods=['GET'])
def get_donation(donation_id):
    try:
        donation = db.get_donation(donation_id)
        return jsonify(donation) if donation else jsonify({"error": "Donation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@donation_routes.route('/<int:donation_id>', methods=['PUT'])
def update_donation(donation_id):
    try:
        request_data = request.form
        update_data = {key: request_data.get(key) for key in request_data}
        if 'photo' in request.files:
            photo = request.files['photo']
            filename = secure_filename(photo.filename)
            photo_path = os.path.join(app.config['UPLOADED_PHOTOS_DEST'], filename)
            photo.save(photo_path)
            update_data['photo_path'] = photo_path
        
        result, status_code = db.update_donation(donation_id, update_data)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@donation_routes.route('/<int:donation_id>', methods=['DELETE'])
def delete_donation_route(donation_id):
    result = db.delete_donation(donation_id)

    if result["status"] == "success":
        return jsonify(result), 200
    else:
        return jsonify(result), 404  # or 500 if it's a server error



@donation_routes.route("/upload-image/<int:donation_id>", methods=["POST"])
def upload_donation_image(donation_id):
    if 'photo' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(f"donation_{donation_id}_{file.filename}")
        filepath = os.path.join('server', 'uploads', 'donation_images', filename)
        file.save(filepath)
        file_url = f"http://127.0.0.1:5000/api/donations/uploads/donation_images/{filename}"
        update_result = db.update_donation_image(donation_id, file_url)
        return jsonify({
        "message": update_result.get("message", "Donation image URL updated"),
        "status": update_result.get("status", "success"),
        "image_url": file_url
    }), 200 if update_result.get("status") == "success" else 500


@donation_routes.route("/uploads/donation_images/<filename>")
def get_donation_image(filename):
    file_path = os.path.abspath(os.path.join('server', 'uploads', 'donation_images', filename))
    if os.path.exists(file_path):
        return send_file(file_path), 200
    else:
        return jsonify({"error": "File not found"}), 404
    
@donation_routes.route('/geocode', methods=['POST'])
def get_lat_lng():
    data = request.get_json()
    address = data.get('address')
    if not address:
        return jsonify({"error": "Address is required"}), 400

    lat, lng = get_lat_lng_from_address(address)
    if lat is None or lng is None:
        return jsonify({"error": "Could not get coordinates"}), 500

    return jsonify({"latitude": lat, "longitude": lng}), 200
