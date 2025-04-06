from flask import Blueprint, request, jsonify
import MySQLdb.cursors
from server.extensions import mysql  # Import MySQL connection
from datetime import timedelta 
# ✅ Define the Blueprint before using it!
dashboard_routes = Blueprint("dashboard_routes", __name__)

@dashboard_routes.route("/dashboard/<int:user_id>", methods=["GET"])
def get_dashboard_data(user_id):  # ✅ user_id is received from the URL
    """
    Fetch dashboard statistics for the logged-in user.
    """
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # 1️⃣ Total Donations
        cursor.execute("SELECT COUNT(*) AS total_donations FROM fooddonations WHERE user_id = %s", (user_id,))
        total_donations = cursor.fetchone()["total_donations"]

        # 2️⃣ Impact Score (Example logic: 10 points per donation)
        impact_score = total_donations * 10  

        # 3️⃣ Meals Shared
        meals_shared = total_donations * 3

        # 4️⃣ Next Badge Progress
        cursor.execute("SELECT COUNT(*) AS count FROM fooddonations WHERE user_id = %s", (user_id,))
        donations_count = cursor.fetchone()["count"]
        next_badge = "Silver"
        badge_progress = min(100, (donations_count / 10) * 100)

        # 5️⃣ Active Donations
        cursor.execute("SELECT * FROM fooddonations WHERE user_id = %s AND status = 'available'", (user_id,))
        active_donations = cursor.fetchall()
        for donation in active_donations:
            for key, value in donation.items():
                if isinstance(value, timedelta):
                    donation[key] = str(value)
        # 6️⃣ Food Waste Reduced
        food_waste_reduced = total_donations * 1  

        # 7️⃣ People Helped
        people_helped = total_donations * 2  

        # 8️⃣ CO₂ Emissions Saved
        co2_saved = food_waste_reduced * 2  

        # 9️⃣ Nearby Food Available
        cursor.execute("SELECT * FROM fooddonations WHERE status = 'available' ORDER BY expiry_date ASC LIMIT 5")
        nearby_food = cursor.fetchall()

        for food in nearby_food:
            for key, value in food.items():
                if isinstance(value, timedelta):
                    food[key] = str(value)

        

        cursor.close()

        return jsonify({
            "total_donations": total_donations,
            "impact_score": impact_score,
            "meals_shared": meals_shared,
            "next_badge": {
                "name": next_badge,
                "progress": badge_progress
            },
            "active_donations": active_donations,
            "food_waste_reduced": food_waste_reduced,
            "people_helped": people_helped,
            "co2_saved": co2_saved,
            "nearby_food": nearby_food
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
