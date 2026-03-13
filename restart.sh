#!/bin/bash
# restart.sh (бэкенд)
pkill -F backend.pid 2>/dev/null
source venv/bin/activate
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
echo $! > backend.pid
echo "Backend restarted, PID: $(cat backend.pid)"
