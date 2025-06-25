#!/bin/bash

# BrowserTools MCP Middleware Server Startup Script
# This script starts the middleware server that bridges Chrome extension and MCP server

echo "🚀 Starting BrowserTools MCP Middleware Server..."
echo "📋 This server enables browser debugging through Cursor AI"
echo ""

# Check if Chrome is running
if pgrep -x "chrome" > /dev/null || pgrep -x "google-chrome" > /dev/null; then
    echo "✅ Chrome browser detected"
else
    echo "⚠️  Chrome browser not detected - please start Chrome first"
    echo "   Then open DevTools (F12) and look for the BrowserTools tab"
fi

echo ""
echo "🔧 Starting middleware server on ports 3025-3035..."
echo "💡 Keep this terminal open while using BrowserTools"
echo ""
echo "📖 Usage in Cursor:"
echo "   - 'Take a screenshot of the current page'"
echo "   - 'Check console logs for errors'"
echo "   - 'Run a performance audit'"
echo "   - 'Enter debugger mode'"
echo ""

# Start the middleware server
bunx -y @agentdeskai/browser-tools-server@1.2.1 