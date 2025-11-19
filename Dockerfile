# 1. Base image with Python
FROM python:3.12-slim

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of the code
COPY src/ ./src

# 5. Set environment variables (optional but nice)
ENV PYTHONUNBUFFERED=1

# 6. Expose the port your Flask app uses (8080 if you used that)
EXPOSE 8080

# 7. Run the app
CMD ["python", "src/app.py"]
