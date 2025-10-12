#!/bin/bash

# Stop the background development server

PID_FILE=".dev-server.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "⚠️  No development server is running (PID file not found)"
    exit 1
fi

PID=$(cat "$PID_FILE")

if ! ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  Server process not found (PID: $PID)"
    rm "$PID_FILE"
    exit 1
fi

echo "🛑 Stopping development server (PID: $PID)..."
kill $PID

# Wait for process to stop
for i in {1..10}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "✅ Development server stopped successfully!"
        rm "$PID_FILE"
        exit 0
    fi
    sleep 1
done

# If still running, force kill
if ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  Force stopping server..."
    kill -9 $PID
    rm "$PID_FILE"
    echo "✅ Server force stopped"
else
    rm "$PID_FILE"
    echo "✅ Server stopped"
fi
