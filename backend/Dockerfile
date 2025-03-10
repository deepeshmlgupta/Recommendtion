# Use Python 3.11 as the base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the remaining application code
COPY . .

# Expose port 5000 for the Flask app
EXPOSE 5000

# Command to run the Flask application
CMD ["python", "app.py"]
