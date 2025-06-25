#!/bin/bash

# BrowserTools MCP Setup Verification Script
echo "🔍 Checking BrowserTools MCP Setup..."
echo ""

# Check if MCP configuration exists
if [ -f ".cursor/mcp.json" ]; then
    echo "✅ MCP configuration found (.cursor/mcp.json)"
    if grep -q "browsertools" .cursor/mcp.json; then
        echo "✅ BrowserTools MCP server configured"
    else
        echo "❌ BrowserTools MCP server not found in configuration"
    fi
else
    echo "❌ MCP configuration file not found"
fi

echo ""

# Check if packages are available
echo "🔍 Checking package availability..."

if bunx -y @agentdeskai/browser-tools-mcp@1.2.1 --help > /dev/null 2>&1; then
    echo "✅ BrowserTools MCP server package available"
else
    echo "❌ BrowserTools MCP server package not available"
fi

if bunx -y @agentdeskai/browser-tools-server@1.2.1 --help > /dev/null 2>&1; then
    echo "✅ BrowserTools middleware server package available"
else
    echo "❌ BrowserTools middleware server package not available"
fi

echo ""

# Check if Chrome is available
if command -v google-chrome > /dev/null 2>&1; then
    echo "✅ Google Chrome found"
elif command -v chrome > /dev/null 2>&1; then
    echo "✅ Chrome found"
elif command -v chromium > /dev/null 2>&1; then
    echo "✅ Chromium found"
else
    echo "⚠️  Chrome/Chromium not found in PATH"
    echo "   Install Chrome and the BrowserTools extension"
fi

echo ""

# Check if middleware server is running
if curl -s http://localhost:3025/health > /dev/null 2>&1; then
    echo "✅ BrowserTools middleware server is running (port 3025)"
elif curl -s http://localhost:3026/health > /dev/null 2>&1; then
    echo "✅ BrowserTools middleware server is running (port 3026)"
else
    echo "⚠️  BrowserTools middleware server not running"
    echo "   Start it with: bun run browsertools"
fi

echo ""
echo "📋 Setup Summary:"
echo "   1. Install Chrome extension from GitHub releases"
echo "   2. Start middleware server: bun run browsertools"
echo "   3. Open Chrome DevTools and look for BrowserTools tab"
echo "   4. Use Cursor AI commands for debugging"
echo ""
echo "🔗 Full setup guide: docs/browsertools-mcp-setup.md" 