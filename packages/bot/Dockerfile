# Description: Dockerfile for the bot package
#
# Version: 1.0.0
FROM node:18.16.0-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY . .

# Install the dependencies
RUN yarn install

# Build the package
RUN yarn build

# Expose the port
EXPOSE 30001

# Run the package
CMD ["node", "dist/index.js"]

