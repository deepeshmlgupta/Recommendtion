import pandas as pd
import mysql.connector
import os

# ✅ Connect to MySQL
db = mysql.connector.connect(
    host=os.getenv('MYSQL_HOST', 'localhost'),
    port=int(os.getenv('MYSQL_PORT', 3306)),
    user='root',
    password=os.getenv('MYSQL_PASSWORD', 'admin'),
    database=os.getenv('MYSQL_DB', 'user_data')
)
cursor = db.cursor()

# ✅ Load CSV
file_path = "combined_movies_dataset.csv"  # Adjust path if needed
df = pd.read_csv(file_path)

# ✅ Rename columns to remove spaces and special characters
df.columns = df.columns.str.replace(r'\W+', '_', regex=True)

# ✅ Fill NaN values with 0 for genres
genre_columns = [col for col in df.columns if col not in ['movie_id', 'movie_name']]
df[genre_columns] = df[genre_columns].fillna(0).astype(int)

# ✅ Create Table with VARCHAR for movie_id
cursor.execute("""
CREATE TABLE IF NOT EXISTS genre_movies (
    movie_id VARCHAR(20) PRIMARY KEY,  -- Changed from INT to VARCHAR
    movie_name TEXT NOT NULL,
    """ + ", ".join([f"{genre} BOOLEAN" for genre in genre_columns]) + """
)
""")
db.commit()

# ✅ Insert Data into MySQL
df = df.drop_duplicates(subset=['movie_id'], keep="first")
for _, row in df.iterrows():
    values = [row['movie_id'], row['movie_name']] + [row[genre] for genre in genre_columns]
    placeholders = ', '.join(['%s'] * len(values))

    cursor.execute(f"INSERT IGNORE INTO genre_movies VALUES ({placeholders})", values)  # ✅ Skip duplicates

db.commit()

cursor.close()
db.close()

print("✅ Data successfully inserted!")
