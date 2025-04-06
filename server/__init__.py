from flask import Flask, render_template, request
from flask_mysqldb import MySQL  # Import MySQL instance from extensions
from flask_cors import CORS
def create_app():
    app = Flask(__name__)

    # MySQL Configuration
    app.config['MYSQL_HOST'] = 'localhost'
    app.config['MYSQL_USER'] = 'garim'
    app.config['MYSQL_PASSWORD'] = 'Shashi@1415'
    app.config['MYSQL_DB'] = 'foodbank_ai'

    # Initialize MySQL with the app
    mysql.init_app(app)
    CORS(app)

    # Route for home page
    @app.route('/')
    def home():
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM your_table_name')
        results = cursor.fetchall()
        cursor.close()
        return render_template('index.html', results=results)

    # Route for file upload
    @app.route('/upload', methods=['POST'])
    def upload_profile_picture():
        if request.method == 'POST':
            file = request.files['file']
            # Process the uploaded file
            return "File uploaded successfully!"

    # You can add more routes as needed

    return app
