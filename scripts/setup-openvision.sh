#!/bin/bash

# OpenVision MCP Setup Script
# This script helps you configure and test the OpenVision MCP server

echo "🔍 OpenVision MCP Setup"
echo "======================="
echo ""

# Check if UV is installed
if ! command -v ~/.local/bin/uvx &> /dev/null; then
    echo "❌ UV is not installed. Installing..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo "✅ UV installed successfully!"
else
    echo "✅ UV is already installed"
fi

# Test OpenVision installation
echo ""
echo "🧪 Testing OpenVision installation..."
if ~/.local/bin/uvx mcp-openvision --help > /dev/null 2>&1; then
    echo "✅ OpenVision MCP server is installed and working"
else
    echo "❌ OpenVision installation failed"
    exit 1
fi

# Check API key configuration
echo ""
echo "🔑 API Key Configuration"
echo "========================"
echo ""
echo "You need an OpenRouter API key to use OpenVision."
echo "1. Visit: https://openrouter.ai/keys"
echo "2. Create an account and generate an API key"
echo "3. Replace 'YOUR_OPENROUTER_API_KEY_HERE' in .cursor/mcp.json"
echo ""

# Show current configuration
echo "📋 Current MCP Configuration:"
echo "------------------------------"
if [ -f ".cursor/mcp.json" ]; then
    echo "MCP config file exists at .cursor/mcp.json"
    echo ""
    echo "OpenVision server configuration:"
    if grep -q "openvision" .cursor/mcp.json; then
        echo "✅ OpenVision server is configured"
        if grep -q "YOUR_OPENROUTER_API_KEY_HERE" .cursor/mcp.json; then
            echo "⚠️  You need to add your OpenRouter API key"
        else
            echo "✅ API key appears to be configured"
        fi
    else
        echo "❌ OpenVision server not found in configuration"
    fi
else
    echo "❌ MCP config file not found"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Get your OpenRouter API key from https://openrouter.ai/keys"
echo "2. Edit .cursor/mcp.json and replace 'YOUR_OPENROUTER_API_KEY_HERE' with your key"
echo "3. Restart Cursor to load the new MCP server"
echo "4. Test with: bun run test-openvision"
echo ""

echo "💡 Available Models:"
echo "==================="
echo "• qwen/qwen2.5-vl-32b-instruct:free (default - free model)"
echo "• anthropic/claude-3-5-sonnet (premium)"
echo "• openai/gpt-4o (premium)"
echo "• anthropic/claude-3-opus (premium)"
echo ""

echo "✨ OpenVision Features:"
echo "======================"
echo "• Analyze screenshots and UI mockups"
echo "• Extract text from images (OCR)"
echo "• Describe visual elements and layouts"
echo "• Identify design patterns and issues"
echo "• Compare before/after designs"
echo "• Get AI feedback on user interfaces"
echo "" 