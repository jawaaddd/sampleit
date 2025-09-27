FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install React Native CLI globally
RUN npm install -g @react-native-community/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Expose React Native debugger port
EXPOSE 19000

# Start Metro bundler
CMD ["npx", "react-native", "start", "--reset-cache"]

