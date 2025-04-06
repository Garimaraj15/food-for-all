from flask_mysqldb import MySQL
import logging
from datetime import datetime
from flask import current_app as app
import bcrypt
import MySQLdb.cursors  # ✅ Import DictCursor
import os
from flask import request, Flask,jsonify
from werkzeug.utils import secure_filename
from datetime import timedelta,datetime
from server.config import DONATION_UPLOAD_FOLDER
import json
def initialize_app():
    app = Flask(__name__)

    # Database Configuration
    app.config["MYSQL_HOST"] = "localhost"
    app.config["MYSQL_USER"] = "garim"
    app.config["MYSQL_PASSWORD"] = "Shashi@1415"
    app.config["MYSQL_DB"] = "foodbank_ai"

    # Upload folders
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads", "profile_pictures")
    app.config["DONATION_UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads", "donation_images")
    
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["DONATION_UPLOAD_FOLDER"], exist_ok=True)

    mysql = MySQL(app)
    return app, mysql


class FoodQuestDB:
    def __init__(self, mysql):
        self.mysql = mysql  # ✅ Store the MySQL instance

    def execute_query(self, query, params=None, commit=False):
        """Execute a MySQL query with logging and error handling."""
        cursor = None
        try:
            connection = self.mysql.connection  # ✅ Use Flask-MySQLdb connection
            cursor = connection.cursor(MySQLdb.cursors.DictCursor)  # ✅ Use DictCursor for dictionaries
            cursor.execute(query, params if params else ())

            if commit:
                connection.commit()
                logging.info("Query committed successfully")
                return {"status": "success", "message": "Operation successful"}

            result = cursor.fetchall()
            logging.info(f"Query executed successfully: {query}")
            return result
        except Exception as err:
            logging.error(f"Query execution error: {err}")
            return {"status": "error", "message": str(err)}
        finally:
            if cursor is not None:
                cursor.close()
                logging.info("Database cursor closed")
    def allowed_file(self, filename):
        """Check if the file extension is allowed."""
        ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
        return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

    

    def get_all_users(self):
        return self.execute_query("SELECT user_id, full_name, email, phone_number, address, role, created_at FROM users")

    def get_user_by_id(self, user_id):
        result = self.execute_query("SELECT * FROM users WHERE user_id = %s", (user_id,))
        if result:
            user = result[0]
            if "created_at" in user and isinstance(user["created_at"], datetime):
                user["created_at"] = user["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            return user
        return None

    def get_user_by_email(self, email):
        """Get user by email, ensuring the password is fetched correctly."""
        result = self.execute_query("SELECT * FROM users WHERE email = %s", (email,))
        return result[0] if result else None  # ✅ Return dictionary

    def register_user(self, data):
        """Register a new user with a hashed password."""
        hashed_password = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
        query = "INSERT INTO users (full_name, email, phone_number, address, password, role) VALUES (%s, %s, %s, %s, %s, %s)"
        return self.execute_query(query, (data["full_name"], data["email"], data["phone_number"], data["address"], hashed_password, data["role"]), commit=True)

    def update_profile_picture(self, user_id, file_path):
        """Update the user's profile picture in the database."""
        query = "UPDATE users SET profile_picture = %s WHERE user_id = %s"
        result = self.execute_query(query, (file_path, user_id), commit=True)
    
        if result.get("status") == "success":
            print(f"✅ Profile picture updated for user {user_id}")
        else:
            print(f"❌ Error updating profile picture: {result.get('message')}")
    
        return result


    def get_all_transactions(self):
        return self.execute_query("SELECT * FROM transactions")

    def get_leaderboard(self):
        return self.execute_query(""" 
            SELECT u.full_name, COUNT(f.user_id) AS donations 
            FROM users u 
            JOIN food_donations f ON u.user_id = f.user_id 
            GROUP BY u.full_name 
            ORDER BY donations DESC 
        """)

    def list_feedback(self):
        return self.execute_query("SELECT * FROM feedback")

    def add_feedback(self, data):
        query = "INSERT INTO feedback (user_id, message) VALUES (%s, %s)"
        return self.execute_query(query, (data["user_id"], data["message"]), commit=True)

    def get_all_referrals(self):
        return self.execute_query("SELECT * FROM referrals")

    def add_referral(self, data):
        query = "INSERT INTO referrals (user_id, referred_email) VALUES (%s, %s)"
        return self.execute_query(query, (data["user_id"], data["referred_email"]), commit=True)

    def get_all_notifications(self):
        return self.execute_query("SELECT * FROM notifications")

    def get_all_addresses(self):
        return self.execute_query("SELECT * FROM addresses")
    
    

    # Method to create a donatio
    def create_donation(self, user_id, category_id, food_name, description, quantity, nutrients, expiry_date, status,
                        pickup_address, latitude, longitude, pickup_from, pickup_to, pickup_days,
                        contact_preference, additional_notes, safety_confirmed, share_contact_details, photo=None):
        """Create a new donation record with optional image."""
        try:
            cursor = self.mysql.connection.cursor(MySQLdb.cursors.DictCursor)

            # ✅ Check if category exists
            cursor.execute("SELECT COUNT(*) AS count FROM foodcategories WHERE category_id = %s", (category_id,))
            category_check = cursor.fetchone()
            cursor.close()

            if not category_check or category_check["count"] == 0:
                return {"error": "Invalid category_id"}, 400
            latitude = float(latitude) if latitude else None
            longitude = float(longitude) if longitude else None
            # ✅ Handle image upload (only if photo is passed)
            photo_url = None
            if photo and self.allowed_file(photo.filename):
                photo = request.files.get('photo') 
                filename = secure_filename(photo.filename)
                
                # Import the constant path
                
                photo_path = os.path.join(DONATION_UPLOAD_FOLDER, filename)
                photo.save(photo_path)
                photo_url = f"http://127.0.0.1:5000/api/donations/uploads/donation_images/{filename}"
            if isinstance(pickup_days, str):
                try:
                    pickup_days = json.loads(pickup_days)
                except json.JSONDecodeError:
                    pickup_days = {}
                        
            # ✅ Insert into the database
            query = """
                INSERT INTO fooddonations (
                    user_id, category_id, food_name, description, quantity, nutrients, expiry_date, status,
                    pickup_address, latitude, longitude, pickup_from, pickup_to, pickup_days, 
                    contact_preference, additional_notes, safety_confirmed, share_contact_details, photo_path
                )
                VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            self.execute_query(
                query,
                (
                    user_id, category_id, food_name, description, quantity, nutrients, expiry_date, status,
                    pickup_address, latitude, longitude, pickup_from, pickup_to, json.dumps(pickup_days),
                    contact_preference, additional_notes, safety_confirmed, share_contact_details, photo_url
                ),
                commit=True
            )

            return {
    "message": "Donation created successfully",
    "photo_url": photo_url
}, 201
        except Exception as e:
            logging.error(f"Error creating donation: {str(e)}")
            return {"error": "Failed to create donation", "details": str(e)}, 500

        

    def get_all_donations(self):
        """Retrieve all donations and convert timedelta fields."""
        results = self.execute_query("SELECT * FROM fooddonations")  # ❌ No need for donation_id
        
        donations_list = []
        
        for donation in results:
            # Convert timedelta to string if exists
            if isinstance(donation["pickup_from"], timedelta):
                donation["pickup_from"] = str(donation["pickup_from"])
            
            if isinstance(donation["pickup_to"], timedelta):
                donation["pickup_to"] = str(donation["pickup_to"])
            
            donations_list.append(donation)

        return donations_list

    

    def get_donation(self, donation_id):
        """Retrieve a single donation by its ID and convert timedelta fields."""
        result = self.execute_query("SELECT * FROM fooddonations WHERE donation_id = %s", (donation_id,))
        
        if result:
            donation = result[0]  # Fetch only the first record

            # Convert timedelta to string (if exists)
            if isinstance(donation["pickup_from"], timedelta):
                donation["pickup_from"] = str(donation["pickup_from"])
            
            if isinstance(donation["pickup_to"], timedelta):
                donation["pickup_to"] = str(donation["pickup_to"])
            
            return donation
        else:
            return None

    def get_donations_by_user(self, user_id):
        """Retrieve all donations made by a specific user."""
        return self.execute_query("SELECT * FROM fooddonations WHERE user_id = %s", (user_id,))

    def update_donation(self, donation_id, category_id, food_name, quantity, nutrients, expiry_date, status,
                        pickup_address, pickup_from, pickup_to, pickup_days, contact_preference, additional_notes,
                        safety_confirmed, share_contact_details, photo=None):
        """Update an existing donation."""
        try:
            # Handle image update
            photo_path = None
            if photo and self.allowed_file(photo.filename):
                filename = secure_filename(photo.filename)
                photo_path = os.path.join(app.config["DONATION_UPLOAD_FOLDER"], filename)
                photo.save(photo_path)

            query = """
                UPDATE fooddonations
                SET category_id = %s, food_name = %s, quantity = %s, nutrients = %s, expiry_date = %s, status = %s,
                    pickup_address = %s, pickup_from = %s, pickup_to = %s, pickup_days = %s, contact_preference = %s,
                    additional_notes = %s, safety_confirmed = %s, share_contact_details = %s, photo_path = %s
                WHERE donation_id = %s
            """
            return self.execute_query(query, (category_id, food_name, quantity, nutrients, expiry_date, status,
                                              pickup_address, pickup_from, pickup_to, pickup_days, contact_preference,
                                              additional_notes, safety_confirmed, share_contact_details, photo_path, donation_id), commit=True)
        except Exception as e:
            logging.error(f"Error updating donation: {str(e)}")
            return {"error": "Failed to update donation", "details": str(e)}, 500
        
    def check_if_image_exists(self, donation_id):
        """Check if the donation already has a photo URL in the database."""
        query = "SELECT photo_path FROM fooddonations WHERE donation_id = %s"
        result = self.execute_query(query, (donation_id,))
        
        if result:
            return result[0]["photo_path"] is not None  # Returns True if image exists, else False
        return False

    def update_donation_image(self, donation_id, file_url):
        try:
            query = "UPDATE fooddonations SET photo_path = %s WHERE donation_id = %s"
            cursor = self.mysql.connection.cursor()
            cursor.execute(query, (file_url, donation_id))
            self.mysql.connection.commit()
            cursor.close()

            if cursor.rowcount > 0:
                return {"status": "success", "message": "Donation image URL updated"}
            else:
                return {"status": "error", "message": "Donation not found"}
        except Exception as e:
            logging.error(f"Error while updating donation image: {str(e)}")
            return {"status": "error", "message": str(e)}
        
    def delete_donation(self, donation_id):
        try:
            query = "DELETE FROM fooddonations WHERE donation_id = %s"
            cursor = self.mysql.connection.cursor()
            cursor.execute(query, (donation_id,))
            self.mysql.connection.commit()
            cursor.close()

            if cursor.rowcount > 0:
                return {"status": "success", "message": "Donation deleted successfully"}
            else:
                return {"status": "error", "message": "Donation not found"}
        except Exception as e:
            logging.error(f"Error while deleting donation: {str(e)}")
            return {"status": "error", "message": str(e)}
