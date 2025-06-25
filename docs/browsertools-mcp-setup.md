# BrowserTools MCP Setup Guide

## Overview
BrowserTools MCP enables AI-powered browser debugging and analysis through console logs, network requests, screenshots, DOM inspection, and comprehensive audits.

## Architecture
```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│  Cursor AI  │ ──► │  MCP Server  │ ──► │  Node Server  │ ──► │   Chrome    │
│             │ ◄── │  (Protocol)  │ ◄── │ (Middleware)  │ ◄── │  Extension  │
└─────────────┘     └──────────────┘     └───────────────┘     └─────────────┘
```

## Prerequisites
- ✅ Chrome browser
- ✅ Node.js (already have bun)
- ✅ WSL2 environment (your setup)
- ✅ Cursor IDE with MCP support

## Installation Steps

### Step 1: Install Chrome Extension
1. Download the latest Chrome extension from: https://github.com/AgentDeskAI/browser-tools-mcp/releases
2. Look for `v1.2.0 BrowserToolsMCP Chrome Extension`
3. Unzip the downloaded file
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" (toggle in top-right)
6. Click "Load unpacked" and select the unzipped extension folder
7. Verify "BrowserToolsMCP" appears in your extensions list

### Step 2: MCP Server Configuration
The MCP server is already configured in `.cursor/mcp.json`:
```json
{
    "mcpServers": {
        "browsertools": {
            "command": "bunx",
            "args": [
                "-y",
                "@agentdeskai/browser-tools-mcp@1.2.1"
            ]
        }
    }
}
```

### Step 3: Start the Middleware Server
You need to run the middleware server separately:
```bash
bunx -y @agentdeskai/browser-tools-server@1.2.1
```

This server acts as a bridge between the Chrome extension and the MCP server.

## Usage Workflow

### 1. Start the Middleware Server
```bash
# In a terminal (keep this running)
bunx -y @agentdeskai/browser-tools-server@1.2.1
```

### 2. Open Chrome with DevTools
1. Open Chrome and navigate to any page
2. Open Chrome DevTools (F12)
3. Look for the "BrowserTools" tab in DevTools
4. The extension should show connection status

### 3. Use Cursor AI Commands
Once everything is connected, you can use these commands in Cursor:

#### Debug Commands
- "Can you check console and network logs to see what went wrong?"
- "Take a screenshot of the current browser tab"
- "What element is currently selected in the browser?"
- "Wipe the logs to start fresh"

#### Audit Commands
- "Run an accessibility audit on this page"
- "Check the performance of this page"
- "Run an SEO audit"
- "Are there any best practices issues?"
- "Run a NextJS audit" (if using NextJS)

#### Special Modes
- "Enter debugger mode" (runs all debugging tools)
- "Run audit mode" (runs all audit tools)

## Available Tools

### Debugging Tools
- **Console Logs**: `mcp_getConsoleLogs` - Get recent console output
- **Console Errors**: `mcp_getConsoleErrors` - Get console errors only
- **Network Success**: `mcp_getNetworkSuccess` - Get successful HTTP requests
- **Network Errors**: `mcp_getNetworkErrors` - Get failed HTTP requests
- **Screenshots**: `mcp_captureScreenshot` - Take browser screenshots
- **Selected Element**: `mcp_getSelectedElement` - Get currently selected DOM element
- **Wipe Logs**: `mcp_wipeLogs` - Clear all stored logs

### Audit Tools
- **Accessibility**: `mcp_runAccessibilityAudit` - WCAG compliance check
- **Performance**: `mcp_runPerformanceAudit` - Page speed analysis
- **SEO**: `mcp_runSEOAudit` - Search engine optimization
- **Best Practices**: `mcp_runBestPracticesAudit` - Web dev standards
- **NextJS Audit**: `mcp_runNextJSAudit` - NextJS-specific analysis

## Troubleshooting

### Connection Issues
If the MCP server can't connect to the middleware:
1. Ensure the middleware server is running: `bunx -y @agentdeskai/browser-tools-server@1.2.1`
2. Check that Chrome extension is installed and enabled
3. Open Chrome DevTools and look for the BrowserTools tab
4. Try refreshing the browser page

### WSL2 Specific Notes
- The middleware server runs on localhost ports 3025-3035
- WSL2 should handle localhost forwarding automatically
- If you have connection issues, try accessing Chrome from within WSL2

### Screenshot Issues
- Screenshots are saved to `/user/Downloads/mcp-screenshots` by default
- You can configure a custom path in the Chrome extension settings
- Enable "Allow Auto-Paste into Cursor" for automatic screenshot insertion

## Integration with Zombie Digital

This tool is perfect for debugging your Zombie Digital app:

### Real-time Debugging
- Monitor console logs while users interact with profiles
- Track network requests to your Supabase API
- Debug real-time updates and WebSocket connections

### Performance Analysis
- Audit your profile pages for performance issues
- Check accessibility compliance for user profiles
- Optimize SEO for public profile pages

### Development Workflow
- Take screenshots of UI issues for documentation
- Debug Canvas component interactions
- Monitor theme system updates in real-time

## Security & Privacy
- All logs are stored locally on your machine
- No data is sent to third-party services
- The middleware server only runs locally
- Chrome extension only captures data you explicitly request

## Example Usage

```bash
# Terminal 1: Start middleware server
bunx -y @agentdeskai/browser-tools-server@1.2.1

# Terminal 2: Your Next.js dev server (already running)
bun run dev

# In Cursor, ask:
# "Take a screenshot and check console logs for any errors on the profile page"
# "Run a performance audit on the dashboard"
# "Check if there are any accessibility issues with the theme system"
```

This integration will make debugging and optimizing your Zombie Digital platform much more efficient! 