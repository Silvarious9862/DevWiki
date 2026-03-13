#!/bin/bash
# restart.sh — фронтенд (React), надёжная версия

PROJECT_DIR="/home/wiki/wiki-frontend"
LOG_FILE="$PROJECT_DIR/frontend.log"

cd "$PROJECT_DIR" || { echo "Ошибка: не могу перейти в $PROJECT_DIR"; exit 1; }

# === УБИВАЕМ ПО ПОРТУ 3000 ===
echo "Останавливаю процесс на порту 3000..."
fuser -k 3000/tcp 2>/dev/null

# Альтернатива, если fuser недоступен:
# pkill -f "react-scripts start" 2>/dev/null

sleep 30

# === ЗАПУСК ===
echo "Запускаю npm start..."
nohup npm start > "$LOG_FILE" 2>&1 &
FRONTEND_PID=$!

# Опционально: сохрани PID, но помни — он не основной процесс!
echo $FRONTEND_PID > frontend.pid

echo "Фронтенд запущен. Реальный сервер будет на порту 3000."
echo "Лог: tail -f $LOG_FILE"
