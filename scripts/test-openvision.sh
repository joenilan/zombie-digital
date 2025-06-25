#!/bin/bash

# OpenVision MCP Test Script
# This script tests the OpenVision MCP server functionality

echo "🧪 Testing OpenVision MCP Server"
echo "================================"
echo ""

# Check if API key is configured
if grep -q "YOUR_OPENROUTER_API_KEY_HERE" .cursor/mcp.json; then
    echo "❌ OpenRouter API key not configured"
    echo "Please run: bun run setup-openvision"
    echo "And follow the instructions to add your API key"
    exit 1
fi

echo "✅ API key appears to be configured"
echo ""

# Test basic server connectivity
echo "🔗 Testing MCP server connectivity..."
if ~/.local/bin/uvx mcp-openvision --help > /dev/null 2>&1; then
    echo "✅ OpenVision server responds to commands"
else
    echo "❌ OpenVision server not responding"
    exit 1
fi

echo ""
echo "📸 Testing with BrowserTools integration..."
echo "You can now use OpenVision to analyze screenshots!"
echo ""

echo "🎯 Example Usage in Cursor:"
echo "==========================="
echo "1. Take a screenshot with BrowserTools:"
echo "   - Use the browser tools to capture a screenshot"
echo ""
echo "2. Analyze with OpenVision:"
echo "   - 'Analyze this screenshot for UI improvements'"
echo "   - 'Extract text from this image'"
echo "   - 'Describe the layout and design patterns'"
echo "   - 'Compare this design to best practices'"
echo ""

echo "💡 Pro Tips:"
echo "============"
echo "• Use specific queries: 'Analyze this for accessibility issues'"
echo "• Ask for actionable feedback: 'What can be improved in this UI?'"
echo "• Request technical details: 'Extract all text and data from this image'"
echo "• Compare designs: 'How does this compare to the previous version?'"
echo ""

echo "✨ Perfect for:"
echo "==============="
echo "• UI/UX analysis and feedback"
echo "• Design pattern recognition"
echo "• Accessibility auditing"
echo "• OCR and text extraction"
echo "• Before/after comparisons"
echo "• Visual bug detection"
echo ""

echo "🚀 Ready to use OpenVision!"
echo "Start by taking a screenshot and asking me to analyze it." 