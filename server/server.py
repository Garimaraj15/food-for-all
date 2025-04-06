import os
import json
import logging
import bcrypt
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from .config import MYSQL_CONFIG  # ✅ Import MySQL config
from flask_mysqldb import MySQL  # ✅ Use MySQL from extensions
from werkzeug.utils import secure_filename
from datetime import datetime
from dotenv import load_dotenv
from .app_oop import FoodQuestDB, initialize_app  # Database connection
from server.routes.user_routes import user_routes
 # User management routes
from server.routes.file_upload_routes import upload_routes  # File upload routes
from server.routes.donation_routes import donation_routes  # Import donation routes
from flask_uploads import UploadSet, configure_uploads, IMAGES
from server.routes.dashboard_routes import dashboard_routes
from server.routes.leaderboard_routes import leaderboard_routes
from server.routes.food_explore import food_explore
app, db = initialize_app()  # Initialize app with context

# Initialize Flask App
app = Flask(__name__)
CORS(app, supports_credentials=True)  # Allow all origins
app.config.from_object("server.config")
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'garim'
app.config['MYSQL_PASSWORD'] = 'Shashi@1415'
app.config['MYSQL_DB'] = 'foodbank_ai'
app.config['UPLOADED_IMAGES_DEST'] = 'server/uploads/donation_images'
app.config['UPLOADED_IMAGES_ALLOW'] = {'jpg', 'jpeg', 'png', 'gif'}
mysql = MySQL(app)

# Initialize Database Connection
db = FoodQuestDB(mysql)
print("Connection to MySQL successful")

# Directory for Uploaded Files

UPLOAD_FOLDER = os.path.join(os.getcwd(), "server", "uploads", "profile_pictures")  # Absolute path
basedir = os.path.abspath(os.path.dirname(__file__))  # Define the base directory

app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads', 'profile_pictures')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.config['UPLOAD_URL'] = 'server/uploads/profile_pictures'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config["DONATION_UPLOAD_FOLDER"] = os.path.join(basedir, 'uploads', 'donation_images')
app.config["DONATION_UPLOAD_URL"] = 'server/uploads/donation_images'

# Register blueprints
app.register_blueprint(user_routes, url_prefix="/api")
app.register_blueprint(upload_routes, url_prefix="/api")
app.register_blueprint(donation_routes, url_prefix='/api/donations')
app.register_blueprint(dashboard_routes, url_prefix="/api")
app.register_blueprint(leaderboard_routes, url_prefix="/api")
app.register_blueprint(food_explore, url_prefix="/api")
# Logging Setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Create an UploadSet for images
images = UploadSet('images', IMAGES)

# Configure Flask-Uploads with your app
configure_uploads(app, images)
load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not GOOGLE_MAPS_API_KEY:
    raise ValueError("Missing GOOGLE_MAPS_API_KEY in .env file!")
@app.before_request
def log_request():
    print(f"🔍 {request.method} {request.path} - Headers: {dict(request.headers)}")


# ---------------------- Utility Functions ----------------------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def validate_json(required_fields):
    data = request.get_json()
    if not data:
        return {"error": "No input data provided"}, 400
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return {"error": f"Missing fields: {', '.join(missing_fields)}"}, 400
    
    return data, 200


# ---------------------- Health Check ----------------------
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"message": "FoodBank AI API is running!"}), 200


# ---------------------- User Management ----------------------
@app.route("/users", methods=["GET"])
def get_users():
    result = db.get_all_users()
    return jsonify(result), 200
  


# ---------------------- User Profile ----------------------
@app.route("/user/profile/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    user = db.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if "created_at" in user and isinstance(user["created_at"], datetime):
        user["created_at"] = user["created_at"].strftime("%Y-%m-%d %H:%M:%S")

    return jsonify(user), 200

@app.route('/upload-profile', methods=['POST'])
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
@app.route("/user/upload-profile-picture/<int:user_id>", methods=["POST"])
def upload_profile_picture(user_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Ensure the upload directory exists
        upload_folder = app.config.get('UPLOAD_FOLDER', 'server/uploads/profile_pictures')
        os.makedirs(upload_folder, exist_ok=True)

        # Secure the filename
        filename = secure_filename(f"user_{user_id}_{file.filename}")
        filepath = os.path.join(upload_folder, filename)

        # Save the file
        file.save(filepath)

        # Debugging: Check if file is saved
        print(f"Saved file: {filepath}")
        print("Files in directory:", os.listdir(upload_folder))

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
    
@app.route("/uploads/profile_pictures/<filename>")
def uploaded_file(filename):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        return send_from_directory(UPLOAD_FOLDER, filename)

    except Exception as e:
        return jsonify({"error": f"File serving error: {str(e)}"}), 500

# ---------------------- Food Donations ----------------------



# ---------------------- Transactions ----------------------
@app.route("/transactions", methods=["GET"])
def get_transactions():
    return jsonify(db.get_all_transactions()), 200


# ---------------------- Leaderboard ----------------------
@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    return jsonify(db.get_leaderboard()), 200


# ---------------------- Feedback ----------------------
@app.route("/feedback", methods=["GET", "POST"])
def feedback():
    if request.method == "GET":
        return jsonify(db.list_feedback()), 200
    
    required_fields = ["user_id", "message"]
    data, status_code = validate_json(required_fields)
    if status_code != 200:
        return jsonify(data), status_code

    return jsonify(db.add_feedback(data)), 201

@app.route('/upload', methods=['POST'])
def upload():
    if 'image' in request.files:
        image = request.files['image']
        # Saving the file (Flask-Uploads automatically uses secure_filename internally)
        image.save(os.path.join(app.config['UPLOADED_IMAGES_DEST'], image.filename))
        return 'File uploaded successfully', 200
    return 'No file uploaded', 400

@app.route("/api/donations/<int:donation_id>", methods=["GET"])
def get_donation(self, donation_id):
    donation = db.get_donations(donation_id)
    if donation:
        return jsonify(donation), 200
    else:
        return jsonify({"error": "Donation not found"}), 404


    
@app.route('/update_donation_image', methods=['POST'])
def update_image():
    donation_id = request.form.get("donation_id")  # Get donation ID from request
    file = request.files.get("photo")  # Get the uploaded file
    
    if file and allowed_file(file.filename):  # Check if the file is valid
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Now, update the donation image in the database
        db = FoodQuestDB(mysql)
        result = db.update_donation_image(donation_id, file_path)
        
        return result  # Return the result of the update operation

    return {"status": "error", "message": "Invalid file or no file provided"}

@app.route('/donate', methods=['GET', 'POST'])
def donate():
    # your code for handling GET or POST requests
    return 'Donation page'


# ---------------------- Run Flask App ----------------------
if __name__ == "__main__":
    os.environ["FLASK_ENV"] = "development"
    app.run(debug=True, host="0.0.0.0", port=5000)
