# Use the official Node.js runtime as base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install discord.js node-fetch@2

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S discordbot -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R discordbot:nodejs /app
USER discordbot

# Discord bots don't need to expose ports since they connect to Discord's API
# EXPOSE 3000

# Define the command to run the Discord bot
CMD ["node", "discordJect.js"]
