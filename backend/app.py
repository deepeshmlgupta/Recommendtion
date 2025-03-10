from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import firebase_admin
from firebase_admin import auth, credentials
import pandas as pd
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# 🔥 Initialize Firebase Admin SDK
cred = credentials.Certificate("movies-and-music-6622d-firebase-adminsdk-fbsvc-f9ba44a21c.json")
firebase_admin.initialize_app(cred)

# ✅ Ensure CORS headers are included in all responses
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# ✅ Database Connection Function
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        port=int(os.getenv('MYSQL_PORT', 3306)),
        user='root',
        password=os.getenv('MYSQL_PASSWORD', 'admin'),
        database=os.getenv('MYSQL_DB', 'user_data')
    )


# ✅ Create `genre_preferences` table if it doesn’t exist
db = get_db_connection()
cursor = db.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS genre_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    genres TEXT NOT NULL
)
""")
db.commit()
cursor.close()
db.close()

# ✅ Create `music_preferences` table if it doesn’t exist
db = get_db_connection()
cursor = db.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS music_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,  -- Ensure uniqueness
    genres TEXT NOT NULL
)
""")
db.commit()
cursor.close()
db.close()

# ✅ Handle OPTIONS Preflight Requests
@app.route('/save_preferences', methods=['OPTIONS'])
def handle_options():
    return jsonify({"message": "CORS Preflight Handled"}), 200

@app.route('/test_firebase', methods=['GET'])
def test_firebase():
    try:
        user = auth.get_user_by_email("your-email@gmail.com")
        return jsonify({"message": f"User found: {user.email}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# save music preferences
@app.route('/save_music_preferences', methods=['POST'])
def save_music_preferences():
    try:
        db = get_db_connection()
        cursor = db.cursor()

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        id_token = auth_header.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(id_token)
        user_email = decoded_token.get("email")

        if not user_email:
            return jsonify({"error": "Email not found in token"}), 400

        data = request.json
        genres = ",".join(data.get("genres", []))  # Convert list to comma-separated string

        cursor.execute("DELETE FROM music_preferences WHERE user_email = %s", (user_email,))
        cursor.execute("INSERT INTO music_preferences (user_email, genres) VALUES (%s, %s)", (user_email, genres))
        db.commit()

        cursor.close()
        db.close()
        return jsonify({"message": "Music preferences saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# music preferences
@app.route('/get_music_preferences/<email>', methods=['GET'])
def get_music_preferences(email):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT genres FROM music_preferences WHERE user_email = %s", (email,))
        result = cursor.fetchone()

        cursor.close()
        db.close()

        preferences = result[0].split(",") if result else []
        return jsonify({"music_preferences": preferences})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Save User Preferences
@app.route('/save_preferences', methods=['POST'])
def save_preferences():
    try:
        db = get_db_connection()
        cursor = db.cursor()

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        id_token = auth_header.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(id_token)
        user_email = decoded_token.get("email")

        if not user_email:
            return jsonify({"error": "Email not found in token"}), 400

        data = request.json
        genres = ",".join(data.get("genres", []))

        cursor.execute("DELETE FROM genre_preferences WHERE user_email = %s", (user_email,))
        cursor.execute("INSERT INTO genre_preferences (user_email, genres) VALUES (%s, %s)", (user_email, genres))
        db.commit()

        cursor.close()
        db.close()
        return jsonify({"message": "Preferences saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Get User Preferences
@app.route('/get_preferences/<email>', methods=['GET'])
def get_preferences(email):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT genres FROM genre_preferences WHERE user_email = %s", (email,))
        result = cursor.fetchone()

        cursor.close()
        db.close()

        preferences = result[0].split(",") if result else []
        return jsonify({"preferences": preferences})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Function to get available genres dynamically from the database
def get_available_genres():
    """
    Fetch the list of available genres dynamically from the MySQL database.

    Returns:
    - A list of available genre names.
    """
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # ✅ Get available genres (column names excluding 'movie_id' and 'movie_name')
        cursor.execute("SHOW COLUMNS FROM genre_movies")
        all_columns = [column['Field'] for column in cursor.fetchall()]
        genre_columns = [col for col in all_columns if col not in ['movie_id', 'movie_name']]

        cursor.close()
        db.close()

        return genre_columns

    except Exception as e:
        return {"error": str(e)}

#  Function to recommend movies based on user-selected genres
def recommend_movies_by_genres(input_genres):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Fetch available genres from the database
        available_genres = get_available_genres()
        if isinstance(available_genres, dict) and "error" in available_genres:
            print("❌ Error fetching available genres:", available_genres["error"])
            return {"error": available_genres["error"]}

        # Filter valid genres
        valid_genres = [genre for genre in input_genres if genre in available_genres]
        if not valid_genres:
            print("❌ No valid genres selected from user input:", input_genres)
            return {"error": "No valid genres selected."}

        # Create a weighted sum of selected genres
        genre_sum = " + ".join(valid_genres)  

        # ✅ Updated SQL Query: Sort by genre match AND year (newest first)
        query = f"""
            SELECT movie_id
            FROM genre_movies
            WHERE ({genre_sum}) > 0 AND year > 1980 AND year < 2023
            ORDER BY ({genre_sum}) DESC, year DESC
            LIMIT 50;
        """

        print("🔍 Executing SQL Query:", query)  # Debugging SQL execution
        cursor.execute(query)
        recommended_movies = cursor.fetchall()

        cursor.close()
        db.close()

        if not recommended_movies:
            print("❌ No movies found for selected genres:", valid_genres)

        return [movie["movie_id"] for movie in recommended_movies]

    except Exception as e:
        print("❌ Error in recommend_movies_by_genres:", str(e))
        return {"error": str(e)}


# ✅ API to fetch recommended movies based on user-selected genres
@app.route('/get_recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        user_genres = data.get("genres", [])

        print("🔍 Received genres from frontend:", user_genres)  # Debug input

        recommended_movie_ids = recommend_movies_by_genres(user_genres)

        if isinstance(recommended_movie_ids, dict) and "error" in recommended_movie_ids:
            print(" Error from recommendation function:", recommended_movie_ids["error"])
            return jsonify({"error": recommended_movie_ids["error"], "movie_ids": []}), 400

        print(" Returning Movie IDs:", recommended_movie_ids)  # Debug output
        return jsonify({"movie_ids": recommended_movie_ids if recommended_movie_ids else []}), 200

    except Exception as e:
        print(" Exception in /get_recommendations:", str(e))
        return jsonify({"error": str(e), "movie_ids": []}), 500



if __name__ == '__main__':
    app.run(debug=True)
