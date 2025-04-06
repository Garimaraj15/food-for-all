import mysql.connector
from mysql.connector import Error
import os

# MySQL Configuration
MYSQL_CONFIG = {
    "db": "foodbank_ai",
    "user": "garim",
    "password": "Shashi@1415",
    "host": "localhost"
}

# File Upload Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "profile_pictures")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DONATION_UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "donation_images")
os.makedirs(DONATION_UPLOAD_FOLDER, exist_ok=True)  # Ensure donation folder exists
DONATION_ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
DONATION_UPLOAD_URL = "/uploads/donation_images"
# MySQL Connection Test
try:
    mysql_connection = mysql.connector.connect(
        host=MYSQL_CONFIG["host"],
        user=MYSQL_CONFIG["user"],
        password=MYSQL_CONFIG["password"],
        database=MYSQL_CONFIG["db"]
    )
    if mysql_connection.is_connected():
        print("Connection to MySQL successful")
except Error as e:
    print(f"Error: {e}")
