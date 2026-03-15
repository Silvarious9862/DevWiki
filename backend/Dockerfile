FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV APP_MODULE=app.main:app \
    HOST=0.0.0.0 \
    PORT=8000 \
    DB_HOST=db \
    DB_PORT=5432

RUN chmod +x ./wait_for_db.sh

EXPOSE 8000

CMD ["./wait_for_db.sh", "sh", "-c", "uvicorn ${APP_MODULE} --host ${HOST} --port ${PORT}"]
