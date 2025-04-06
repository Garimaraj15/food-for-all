from flask import Blueprint, request, jsonify
import MySQLdb.cursors
from server.extensions import mysql  # Import MySQL connection

leaderboard_routes = Blueprint("leaderboard_routes", __name__)

@leaderboard_routes.route("/leaderboard/<int:user_id>", methods=["GET"])
def get_leaderboard(user_id):
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        # 🏆 1. Fetch Top Donors (Top 3 users)
        cursor.execute("""
            SELECT u.user_id, u.full_name AS name, u.profile_picture AS profile_pic,
                   COUNT(f.donation_id) AS total_donations, 
                   COUNT(f.donation_id) * 30 AS impact_score
            FROM users u
            JOIN fooddonations f ON u.user_id = f.user_id
            GROUP BY u.user_id, u.full_name, u.profile_picture
            ORDER BY total_donations DESC
            LIMIT 3
        """)
        top_donors = cursor.fetchall()

        # 🏅 2. Fetch User’s Profile and Stats
        cursor.execute("""
            SELECT u.full_name AS name, u.profile_picture AS profile_pic, COUNT(f.donation_id) AS total_donations
            FROM users u
            LEFT JOIN fooddonations f ON u.user_id = f.user_id
            WHERE u.user_id = %s
            GROUP BY u.user_id, u.full_name, u.profile_picture
        """, (user_id,))

        user_data = cursor.fetchone()

        total_donations = user_data.get("total_donations", 0) if user_data else 0
        impact_score = total_donations * 30
        profile_pic = user_data.get("profile_pic", "") if user_data else ""

        # 🎖️ 3. Determine Donor Level
        if total_donations >= 30:
            donor_level = "Gold"
        elif total_donations >= 20:
            donor_level = "Silver"
        elif total_donations >= 10:
            donor_level = "Bronze"
        else:
            donor_level = "Beginner"

        # 🚀 4. Next Badge Progress
        next_badge = "Gold" if donor_level == "Silver" else "Silver"
        next_badge_progress = min(100, (total_donations / 30) * 100)

        # Handle donations_needed correctly
        if donor_level == "Gold":
            donations_needed = 0
        elif donor_level == "Silver":
            donations_needed = max(30 - total_donations, 0)
        else:
            donations_needed = max(20 - total_donations, 0)

        # 📊 5. Leaderboard Rankings
        cursor.execute("""
            SELECT u.user_id, u.full_name AS name, u.profile_picture AS profile_pic, COUNT(f.donation_id) AS total_donations
            FROM users u
            LEFT JOIN fooddonations f ON u.user_id = f.user_id
            GROUP BY u.user_id, u.full_name, u.profile_picture
            ORDER BY total_donations DESC
        """)
    
        
        rankings = cursor.fetchall()

        # Find user ranking
        user_rank = next((i + 1 for i, r in enumerate(rankings) if r["user_id"] == user_id), None)

        total_users = len(rankings)
        if user_rank is None:
            user_rank = total_users + 1  # If not in leaderboard, place at the end
        
        user_percentile = round((user_rank / total_users) * 100, 2) if total_users > 0 else 100

        cursor.close()
        return jsonify({
            "top_donors": top_donors,
            "user_stats": {
                "name": user_data.get("name", "Unknown") if user_data else "Unknown",
                "profile_pic": profile_pic,
                "total_donations": total_donations,
                "impact_score": impact_score,
                "donor_level": donor_level,
                "next_badge": next_badge,
                "next_badge_progress": next_badge_progress,
                "donations_needed": donations_needed
            },
            "leaderboard_rankings": rankings,
            "user_ranking": {
                "position": user_rank,
                "percentile": user_percentile
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
