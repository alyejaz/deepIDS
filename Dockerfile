FROM python:3.10-slim

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
# We install these first to leverage caching
RUN pip install --no-cache-dir \
    numpy==1.22.4 \
    pandas==1.4.4 \
    scikit-learn==1.1.2 \
    tensorflow==2.10.0 \
    scipy==1.9.1 \
    flask

# Copy project files
COPY . .

# Install Node dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "app.js"]
