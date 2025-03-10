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

# ✅ Load CSV File
file_path = "combined_movies_dataset_year.csv"  # Adjust path if needed
df = pd.read_csv(file_path, dtype={"year": str}, low_memory=False)


# ✅ Ensure Column Names are Clean
df.columns = df.columns.str.replace(r'\W+', '_', regex=True)

# ✅ Check if 'year' column exists
if "year" not in df.columns:
    raise ValueError("CSV file does not contain 'year' column!")

# ✅ Convert 'year' column to INT (if not already)
df["year"] = pd.to_numeric(df["year"], errors="coerce").fillna(0).astype(int)
cursor.execute("ALTER TABLE genre_movies ADD COLUMN year INT")
db.commit()
# ✅ Update Year Data in MySQL Table
for _, row in df.iterrows():
    cursor.execute("UPDATE genre_movies SET year = %s WHERE movie_id = %s", (row["year"], row["movie_id"]))

db.commit()
cursor.close()
db.close()

print("✅ Year data updated successfully!")
