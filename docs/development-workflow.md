# Development Workflow

## 🚀 Quick Start

### One Command Development
```bash
bun run dev
```

This single command now automatically starts:
- ✅ **Next.js dev server** (localhost:3000)
- ✅ **BrowserTools MCP server** (screenshot & debugging tools)

## 📋 Available Scripts

### Development
- `bun run dev` - **Recommended**: Starts Next.js + BrowserTools together
- `bun run dev:next-only` - Start only Next.js dev server (if needed)

### BrowserTools
- `bun run browsertools` - Start BrowserTools separately
- `bun run check-browsertools` - Check BrowserTools status

### OpenVision
- `bun run setup-openvision` - Setup OpenVision MCP server
- `bun run test-openvision` - Test OpenVision functionality

### Standard
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run test` - Run tests

## 🛠 MCP Tools Available During Development

### BrowserTools (Auto-starts with dev)
- 📸 **Screenshots**: Capture any page state for analysis
- 🐛 **Console Logs**: Monitor JavaScript errors and warnings
- 🌐 **Network Monitoring**: Track API calls and performance
- ♿ **Accessibility Audits**: Automated accessibility testing
- ⚡ **Performance Audits**: Core Web Vitals and optimization

### OpenVision (After setup)
- 🔍 **AI Image Analysis**: Analyze screenshots with AI
- 📝 **OCR**: Extract text from images
- 🎨 **UI/UX Feedback**: Get design recommendations
- ♿ **Visual Accessibility**: Check accessibility visually

## 🔄 Typical Development Workflow

### 1. Start Development
```bash
bun run dev
```

### 2. Develop & Test
- Make code changes
- View at http://localhost:3000
- BrowserTools automatically tracks your navigation

### 3. Get AI Feedback
```bash
# In your conversation with the AI:
"Take a screenshot and analyze it for improvements"
"Check this page for accessibility issues"
"What can be improved in this design?"
```

### 4. Iterate
- Implement suggested changes
- Take new screenshots
- Compare with OpenVision analysis

## 🎯 Perfect for UI/UX Development

This setup is ideal for:
- **Rapid UI iteration** with instant AI feedback
- **Accessibility testing** with visual analysis
- **Performance monitoring** during development
- **Design system consistency** checks
- **Before/after comparisons** when making changes

## 🛑 Stopping Development

To stop both servers:
```bash
Ctrl+C
```

This will gracefully shut down both Next.js and BrowserTools.

## 🔧 Troubleshooting

### BrowserTools Not Starting
```bash
# Check if already running
bun run check-browsertools

# Start manually if needed
bun run browsertools
```

### Chrome Extension Issues
1. Make sure Chrome extension is installed
2. Check DevTools → BrowserTools tab
3. Refresh if connection lost

### OpenVision Not Working
1. Check API key in `.cursor/mcp.json`
2. Restart Cursor to reload MCP servers
3. Test with: `bun run test-openvision`

---

**💡 Pro Tip**: Keep the terminal open to see both Next.js hot reload logs and BrowserTools connection status in one place! 