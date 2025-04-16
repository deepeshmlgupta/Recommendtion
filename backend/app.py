from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import firebase_admin
import os
from firebase_admin import auth, credentials
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Firebase Admin SDK
cred = credentials.Certificate("movies-and-music-6622d-firebase-adminsdk-fbsvc-f9ba44a21c.json")
firebase_admin.initialize_app(cred)

# Database Connection Function
DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'mysql'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'user': 'root',
    'password': os.getenv('MYSQL_PASSWORD', 'admin'),
    'database': os.getenv('MYSQL_DB', 'user_data')
}

# Initialize all required tables
def initialize_tables():
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        # Genre Preferences Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS genre_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL UNIQUE,
            genres TEXT NOT NULL
        )
        """)
        
        # Music Preferences Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS music_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL UNIQUE,
            genres TEXT NOT NULL
        )
        """)
        
        # User Movie Clicks Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_clicks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            movie_id VARCHAR(255) NOT NULL,
            click_count INT DEFAULT 1,
            last_clicked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_movie (email, movie_id)
        )
        """)
        
        # User Music Clicks Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_music_clicks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            track_id VARCHAR(255) NOT NULL,
            click_count INT DEFAULT 1,
            last_clicked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_track (email, track_id)
        )
        """)
        
        # Genre Music Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS genre_music (
            track_id VARCHAR(255) PRIMARY KEY,
            track_name VARCHAR(255),
            artist VARCHAR(255),
            year INT,
            Pop TINYINT(1),
            Rock TINYINT(1),
            HipHop TINYINT(1),
            Jazz TINYINT(1),
            Classical TINYINT(1),
            Electronic TINYINT(1),
            Country TINYINT(1),
            RnB TINYINT(1),
            Reggae TINYINT(1),
            Metal TINYINT(1)
        )
        """)
        
        db.commit()
        cursor.close()
        db.close()
        print("✅ Database tables initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing tables: {str(e)}")

# Initialize tables when starting the app
initialize_tables()

# CORS Headers
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Helper function to get available movie genres
def get_available_movie_genres():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SHOW COLUMNS FROM genre_movies")
        all_columns = [column['Field'] for column in cursor.fetchall()]
        genre_columns = [col for col in all_columns if col not in ['movie_id', 'movie_name', 'year']]
        cursor.close()
        db.close()
        return genre_columns
    except Exception as e:
        return {"error": str(e)}

# Helper function to get available music genres
def get_available_music_genres():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SHOW COLUMNS FROM genre_music")
        all_columns = [column['Field'] for column in cursor.fetchall()]
        genre_columns = [col for col in all_columns if col not in ['track_id', 'track_name', 'artist', 'year']]
        cursor.close()
        db.close()
        return genre_columns
    except Exception as e:
        return {"error": str(e)}
    
# Music Recommendation Engine
def recommend_music_by_genres(email, input_genres):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        available_genres = get_available_music_genres()
        valid_genres = [genre for genre in input_genres if genre in available_genres]
        if not valid_genres:
            return {"error": "No valid music genres selected."}

        genre_sum = " + ".join(valid_genres)  

        query = f"""
            SELECT gm.track_id
            FROM genre_music gm
            LEFT JOIN user_music_clicks uc ON gm.track_id = uc.track_id AND uc.email = %s
            WHERE ({genre_sum}) > 0
            ORDER BY 
                COALESCE(uc.click_count, 0) DESC,
                gm.year DESC
            LIMIT 50;
        """

        cursor.execute(query, (email,))
        recommended_tracks = cursor.fetchall()
        
        cursor.close()
        db.close()

        return [track["track_id"] for track in recommended_tracks]

    except Exception as e:
        return {"error": str(e)}

# API Endpoints
@app.route('/get_recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()
        user_email = data.get("email")

        if not user_email:
            return jsonify({"error": "Email is required", "movie_ids": []}), 400

        # First fetch user's genres from genre_preferences table
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT genres FROM genre_preferences 
            WHERE user_email = %s
        """, (user_email,))
        
        result = cursor.fetchone()
        cursor.close()
        db.close()

        if not result:
            return jsonify({"error": "No genre preferences found for user", "movie_ids": []}), 404

        user_genres = result["genres"].split(",")
        recommended_movie_ids = recommend_movies_by_genres(user_email)

        if isinstance(recommended_movie_ids, dict) and "error" in recommended_movie_ids:
            return jsonify({"error": recommended_movie_ids["error"], "movie_ids": []}), 400

        return jsonify({"movie_ids": recommended_movie_ids if recommended_movie_ids else []}), 200

    except Exception as e:
        return jsonify({"error": str(e), "movie_ids": []}), 500


def recommend_movies_by_genres(email):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # First get user's genres
        cursor.execute("""
            SELECT genres FROM genre_preferences 
            WHERE user_email = %s
        """, (email,))
        
        result = cursor.fetchone()
        if not result:
            return {"error": "User genre preferences not found"}

        user_genres = result["genres"].split(",")
        available_genres = get_available_movie_genres()
        valid_genres = [genre for genre in user_genres if genre in available_genres]
        
        if not valid_genres:
            return {"error": "No valid movie genres selected."}
            
        genre_sum = " + ".join(valid_genres)  

        query = f"""
            SELECT gm.movie_id
            FROM genre_movies gm
            LEFT JOIN user_clicks uc ON gm.movie_id = uc.movie_id AND uc.email = %s
            WHERE ({genre_sum}) > 0
            ORDER BY 
                COALESCE(uc.click_count, 0) DESC,
                gm.year DESC
            LIMIT 100;
        """

        cursor.execute(query, (email,))
        recommended_movies = cursor.fetchall()
        
        cursor.close()
        db.close()

        return [movie["movie_id"] for movie in recommended_movies]

    except Exception as e:
        return {"error": str(e)}
    

@app.route('/get_music_recommendations', methods=['POST'])
def get_music_recommendations():
    try:
        data = request.get_json()
        user_genres = data.get("genres", [])
        user_email = data.get("email")

        if not user_email:
            return jsonify({"error": "Email is required", "track_ids": []}), 400

        recommended_track_ids = recommend_music_by_genres(user_email, user_genres)

        if isinstance(recommended_track_ids, dict) and "error" in recommended_track_ids:
            return jsonify({"error": recommended_track_ids["error"], "track_ids": []}), 400

        return jsonify({"track_ids": recommended_track_ids if recommended_track_ids else []}), 200

    except Exception as e:
        return jsonify({"error": str(e), "track_ids": []}), 500


@app.route('/save_click', methods=['POST'])
def save_click():
    try:
        data = request.get_json()
        email = data.get("email")
        movie_id = data.get("movie_id")

        if not email or not movie_id:
            return jsonify({"error": "Email and Movie ID are required"}), 400

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO user_clicks (email, movie_id, click_count) 
            VALUES (%s, %s, 1) 
            ON DUPLICATE KEY UPDATE click_count = click_count + 1, last_clicked = NOW()
        """, (email, movie_id))

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Movie click saved successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/save_music_click', methods=['POST'])
def save_music_click():
    try:
        data = request.get_json()
        email = data.get("email")
        track_id = data.get("track_id")

        if not email or not track_id:
            return jsonify({"error": "Email and Track ID are required"}), 400

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO user_music_clicks (email, track_id, click_count) 
            VALUES (%s, %s, 1) 
            ON DUPLICATE KEY UPDATE click_count = click_count + 1, last_clicked = NOW()
        """, (email, track_id))

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Music click saved successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Existing endpoints for preferences
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
        return jsonify({"message": "Movie preferences saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        genres = ",".join(data.get("genres", []))

        cursor.execute("DELETE FROM music_preferences WHERE user_email = %s", (user_email,))
        cursor.execute("INSERT INTO music_preferences (user_email, genres) VALUES (%s, %s)", (user_email, genres))
        db.commit()

        cursor.close()
        db.close()
        return jsonify({"message": "Music preferences saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

# Add to your Flask app.py

@app.route('/available-movie-genres', methods=['GET'])
def available_movie_genres():
    try:
        genres = get_available_movie_genres()
        return jsonify(genres)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/available-music-genres', methods=['GET'])
def available_music_genres():
    try:
        genres = get_available_music_genres()
        return jsonify(genres)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True)
if __name__ == '__main__':
    # Never run with debug=True in production
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true')