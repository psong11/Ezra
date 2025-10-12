# Development Server Management

This folder contains scripts to easily manage the Next.js development server without having to manually type `npm run dev` each time.

## 🚀 Quick Start

### Option 1: Run in Background (Recommended)
Start the server and let it run in the background:
```bash
./start-dev.sh
```

Check if it's running:
```bash
./status-dev.sh
```

Stop the server:
```bash
./stop-dev.sh
```

### Option 2: Run in Terminal
If you want to see live logs in your terminal:
```bash
./dev.sh
```
Press `Ctrl+C` to stop.

### Option 3: Use npm scripts
```bash
npm run dev:start    # Start in background
npm run dev:stop     # Stop background server
npm run dev:status   # Check server status
```

## 📋 Script Details

### `start-dev.sh`
- Starts the development server in the background
- Creates a PID file (`.dev-server.pid`) to track the process
- Logs output to `dev-server.log`
- Checks if server is already running to prevent duplicates
- Shows initial server output

### `stop-dev.sh`
- Gracefully stops the background server
- Removes the PID file
- Force kills if graceful shutdown fails

### `status-dev.sh`
- Shows if the server is running
- Displays the process ID (PID)
- Shows recent log entries

### `dev.sh`
- Simple wrapper around `npm run dev`
- Runs in foreground with live output
- Good for debugging

## 📝 Log Files

When using background mode:
- **Live logs**: `tail -f dev-server.log`
- **Last 50 lines**: `tail -n 50 dev-server.log`
- **Search logs**: `grep "error" dev-server.log`

## 🔄 Auto-Start on System Boot (macOS)

If you want the dev server to start automatically when you log in:

1. Create a Launch Agent:
```bash
cat > ~/Library/LaunchAgents/com.ezra.devserver.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ezra.devserver</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/paulsong/Documents/Personal_Projects/Ezra/start-dev.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/Users/paulsong/Documents/Personal_Projects/Ezra</string>
    <key>StandardOutPath</key>
    <string>/Users/paulsong/Documents/Personal_Projects/Ezra/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/paulsong/Documents/Personal_Projects/Ezra/launchd-error.log</string>
</dict>
</plist>
EOF
```

2. Load the Launch Agent:
```bash
launchctl load ~/Library/LaunchAgents/com.ezra.devserver.plist
```

3. To disable auto-start:
```bash
launchctl unload ~/Library/LaunchAgents/com.ezra.devserver.plist
```

## 🐛 Troubleshooting

**Server won't start:**
- Check if port is already in use: `lsof -i :3000`
- Check logs: `cat dev-server.log`
- Try stopping first: `./stop-dev.sh`

**Can't find scripts:**
- Make sure they're executable: `chmod +x *.sh`
- Run from project root: `cd /Users/paulsong/Documents/Personal_Projects/Ezra`

**Stale PID file:**
- If server crashed, remove manually: `rm .dev-server.pid`
- Then start fresh: `./start-dev.sh`

## 💡 Tips

- Background mode is perfect for working on multiple projects
- The server will automatically restart when you save code changes (Next.js hot reload)
- Logs are helpful for debugging API routes and server-side issues
- You can open the log file in VS Code: `code dev-server.log`
