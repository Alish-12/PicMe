FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src ./src

EXPOSE 8080

ENV APP_HOST=0.0.0.0 \
    APP_PORT=8080 \
    LOG_LEVEL=INFO \
    LOG_TO_STDOUT=1

CMD ["gunicorn", "-w", "3", "-b", "0.0.0.0:8080", "src.app:create_app()"]
