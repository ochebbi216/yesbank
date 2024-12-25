
# Use an official Node.js image as a parent image for building the app
FROM node:18 AS build-stage

# Set the working directory inside the container
WORKDIR /app

# Copy Angular project files
COPY . .

# Install dependencies and build the project
RUN npm install && npm run build --prod

# Use a lightweight Nginx image to serve the app
FROM nginx:alpine AS production-stage

# Copy the build files to the Nginx HTML directory
COPY --from=build-stage /app/dist/bankfront /usr/share/nginx/html

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
