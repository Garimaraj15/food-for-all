from flask import Blueprint, request, jsonify
import MySQLdb.cursors
from server.extensions import mysql
from geopy.distance import geodesic
from datetime import datetime, date

food_explore = Blueprint("food_explore", __name__)

@food_explore.route("/food/explore", methods=["GET"])
def explore_food():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        search_query = request.args.get("search", "").lower().strip()
        lat_param = request.args.get("lat")
        lng_param = request.args.get("lng")
        radius_param = request.args.get("radius", 10)  # Default radius = 10 miles

        use_location_filter = lat_param and lng_param
        if use_location_filter:
            user_lat = float(lat_param)
            user_lng = float(lng_param)
            max_distance = float(radius_param)

        # Get all available food donations
        cursor.execute("""
            SELECT d.donation_id, d.food_name, d.category, d.description, d.expiry_date, d.created_at, 
                   d.latitude, d.longitude, i.image_url
            FROM fooddonations d
            LEFT JOIN donationimages i ON d.donation_id = i.donation_id
            WHERE d.status = 'available'
        """)
        donations = cursor.fetchall()
        cursor.close()

        result = []
        for donation in donations:
            # Location filter
            if use_location_filter and donation["latitude"] and donation["longitude"]:
                user_location = (user_lat, user_lng)
                food_location = (donation["latitude"], donation["longitude"])
                distance = geodesic(user_location, food_location).miles
                if distance > max_distance:
                    continue

            # Search filter
            if search_query and search_query not in donation["food_name"].lower():
                continue

            # Format listed time
            time_diff = datetime.now() - donation["created_at"]
            if time_diff.total_seconds() < 3600:
                listed_time = f"{int(time_diff.total_seconds() // 60)} minutes ago"
            elif time_diff.total_seconds() < 86400:
                listed_time = f"{int(time_diff.total_seconds() // 3600)} hours ago"
            else:
                listed_time = f"{int(time_diff.total_seconds() // 86400)} days ago"

            # Format expiry
            expiry_days = (donation["expiry_date"] - date.today()).days
            expires_in = f"{expiry_days} days" if expiry_days > 0 else "Today"

            image_url = donation["image_url"] or f"/placeholder.svg?text={donation['food_name'].replace(' ', '+')}"

            result.append({
                "id": donation["donation_id"],
                "name": donation["food_name"],
                "category": donation["category"],
                "description": donation["description"],
                "time": listed_time,
                "expires": expires_in,
                "image": image_url
            })

        return jsonify({"food_items": result, "total": len(result)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
