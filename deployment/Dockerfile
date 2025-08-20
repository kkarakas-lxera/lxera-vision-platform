FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY agent_graph/ ./agent_graph/
COPY src/ ./src/
COPY *.py ./

# Create logs directory
RUN mkdir -p logs

# Health check endpoint
COPY deployment/health_check.py ./health_check.py

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python health_check.py

# Run the application
CMD ["python", "-m", "agent_graph.api.main"]
