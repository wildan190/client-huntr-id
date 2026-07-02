# WebSocket Setup Guide

## Quick Fix for WebSocket Errors

The WebSocket errors you're seeing (`this.pusher.subscribe is not a function`) occur because the Reverb WebSocket server is not running. Here's how to fix it:

### 1. Start the Reverb Server

```bash
# Navigate to the API directory
cd api.huntr.id

# Start the Reverb WebSocket server
php artisan reverb:start --host=0.0.0.0 --port=8080
```

Keep this terminal window open - the server needs to run continuously.

### 2. Verify Configuration

Make sure these environment variables are set correctly:

**Backend (api.huntr.id/.env.local):**
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=707885
REVERB_APP_KEY=vu5cy7oiaacldbe7gvma
REVERB_APP_SECRET=sntua9cnkrclla1apikd
REVERB_HOST=reverb
REVERB_PORT=8080
REVERB_SCHEME=http
```

**Frontend (client-huntr-id/.env):**
```env
VITE_REVERB_APP_KEY=vu5cy7oiaacldbe7gvma
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### 3. Debug Connection Status

In development mode, you'll see a WebSocket debug panel in the bottom-right corner showing:
- 🟢 Connected: WebSocket working properly
- 🟡 Connecting: Attempting to connect
- 🔴 Failed: Server not available or connection error

### 4. What Was Fixed

1. **Improved Error Handling**: The client now gracefully handles WebSocket connection failures
2. **Connection Retries**: Automatic retry with exponential backoff
3. **Fallback Mechanism**: Switches to polling when WebSocket fails completely
4. **Debug Component**: Visual indicator of connection status in development
5. **Better Logging**: Clear error messages indicating when server is not running

### 5. Production Notes

- In production, ensure the Reverb server is properly deployed and accessible
- Consider using a process manager like Supervisor to keep the WebSocket server running
- Monitor WebSocket server health and implement automatic restarts if needed

### 6. Alternative: Disable WebSocket (Temporary)

If you need to disable WebSocket temporarily:

```env
# In api.huntr.id/.env.local
BROADCAST_CONNECTION=log
```

This will log broadcasts instead of sending them via WebSocket.