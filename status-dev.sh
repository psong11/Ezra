#!/bin/bash

# Check status of the development server

PID_FILE=".dev-server.pid"
LOG_FILE="dev-server.log"

if [ ! -f "$PID_FILE" ]; then
    echo "⚠️  Development server is NOT running"
    echo "🚀 Start it with: ./start-dev.sh"
    exit 1
fi

PID=$(cat "$PID_FILE")

if ps -p $PID > /dev/null 2>&1; then
    echo "✅ Development server is RUNNING"
    echo "📍 PID: $PID"
    echo "📝 Log file: $LOG_FILE"
    echo "🛑 Stop with: ./stop-dev.sh"
    echo ""
    echo "📋 Recent logs (last 20 lines):"
    tail -n 20 "$LOG_FILE"
else
    echo "❌ Server process not found (stale PID: $PID)"
    rm "$PID_FILE"
    echo "🚀 Start it with: ./start-dev.sh"
    exit 1
fi
