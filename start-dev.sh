#!/bin/bash

# Background development server script
# Starts the dev server in the background and keeps it running

PID_FILE=".dev-server.pid"
LOG_FILE="dev-server.log"

# Check if server is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Development server is already running (PID: $PID)"
        echo "📍 Check logs: tail -f $LOG_FILE"
        echo "🛑 To stop: ./stop-dev.sh"
        exit 1
    else
        # Stale PID file, remove it
        rm "$PID_FILE"
    fi
fi

echo "🚀 Starting Ezra Bible App development server in background..."

# Start the server in background
nohup npm run dev > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Save the PID
echo $SERVER_PID > "$PID_FILE"

# Wait a moment to check if it started successfully
sleep 3

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Development server started successfully!"
    echo "📍 PID: $SERVER_PID"
    echo "📝 Logs: tail -f $LOG_FILE"
    echo "🌐 Server will be available at http://localhost:3000 (or next available port)"
    echo "🛑 To stop: ./stop-dev.sh"
    
    # Show initial logs
    echo ""
    echo "📋 Initial server output:"
    tail -n 10 "$LOG_FILE"
else
    echo "❌ Failed to start server. Check $LOG_FILE for details."
    rm "$PID_FILE"
    exit 1
fi
