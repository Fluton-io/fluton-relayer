# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml files to the container
COPY package.json ./

# Install the dependencies using pnpm
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Run the script using node
CMD ["npm", "run", "dev"]