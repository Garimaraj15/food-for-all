from flask import Blueprint

# Define a function to import routes dynamically
def register_routes():
    from routes.user_routes import user_routes  # Import inside the function to avoid circular imports
    return user_routes
