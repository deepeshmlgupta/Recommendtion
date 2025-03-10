# Using Node.js 16 as the base image
FROM node:16

# Setting up the working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (to leverage Docker cache)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]