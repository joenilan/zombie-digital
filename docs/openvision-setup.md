# OpenVision MCP Setup Guide

## 🔍 What is OpenVision?

OpenVision is an AI-powered image analysis tool that integrates with your MCP (Model Context Protocol) setup. It allows you to analyze screenshots, UI mockups, and any images using advanced AI vision models.

## 💰 Cost Information

### **FREE OPTIONS (Recommended to Start)**
- ✅ **qwen/qwen2.5-vl-32b-instruct:free** - Completely free, excellent for most use cases
- ✅ **google/gemini-flash-1.5:free** - Free Google model
- ✅ **openai/gpt-4o-mini:free** - Free GPT-4o mini
- ✅ **anthropic/claude-3-haiku:free** - Free Claude model

### **Premium Options (Pay-per-use)**
- 💰 **anthropic/claude-3-5-sonnet** - ~$3-15 per 1M tokens
- 💰 **openai/gpt-4o** - ~$2.50-10 per 1M tokens  
- 💰 **anthropic/claude-3-opus** - ~$15-75 per 1M tokens

**💡 Pro Tip:** Start with the free models! They're surprisingly capable for UI analysis, OCR, and design feedback.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
# This is handled automatically by the MCP server
bun run setup-openvision
```

### 2. Get API Key (Free)
1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Create a free account
3. Generate an API key (no credit card required for free models)

### 3. Configure API Key
Edit `.cursor/mcp.json` and replace `YOUR_OPENROUTER_API_KEY_HERE` with your actual key:

```json
{
  "mcpServers": {
    "openvision": {
      "env": {
        "OPENROUTER_API_KEY": "sk-or-v1-your-actual-key-here",
        "OPENROUTER_DEFAULT_MODEL": "qwen/qwen2.5-vl-32b-instruct:free"
      }
    }
  }
}
```

### 4. Restart Cursor
Close and reopen Cursor to load the new MCP server.

### 5. Test It
```bash
bun run test-openvision
```

## 🎯 Usage Examples

Once set up, you can use OpenVision in your conversations:

### **Screenshot Analysis**
```
"Take a screenshot and analyze it for UI improvements"
"What accessibility issues do you see in this design?"
"Compare this layout to modern design best practices"
```

### **OCR & Text Extraction**
```
"Extract all text from this image"
"What are the button labels in this screenshot?"
"Read the error message in this image"
```

### **Design Feedback**
```
"How can I improve the visual hierarchy here?"
"Does this follow good UX principles?"
"What's the most attention-grabbing element?"
```

### **Technical Analysis**
```
"Identify all the UI components in this mockup"
"What CSS improvements would you suggest?"
"How does this compare to the previous version?"
```

## 🔧 Advanced Configuration

### Change Models
Edit your `.cursor/mcp.json` to use different models:

```json
"OPENROUTER_DEFAULT_MODEL": "anthropic/claude-3-5-sonnet"  // Premium
"OPENROUTER_DEFAULT_MODEL": "google/gemini-flash-1.5:free"  // Free alternative
```

### Multiple Models
You can switch models in conversation:
```
"Analyze this image using Claude 3.5 Sonnet for detailed feedback"
"Use the free Qwen model to extract text from this image"
```

## 🛠 Troubleshooting

### Server Won't Start
```bash
# Check if UV is installed
~/.local/bin/uvx --version

# Reinstall if needed
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### API Key Issues
- Make sure you copied the full key including `sk-or-v1-` prefix
- Check OpenRouter dashboard for usage limits
- Verify the key has permissions for your chosen model

### Model Not Working
- Free models have rate limits but no cost
- Premium models require credits in your OpenRouter account
- Switch to a different free model if one is overloaded

## 🎉 Perfect Integration with BrowserTools

OpenVision works amazingly well with the BrowserTools MCP you already have:

1. **BrowserTools** captures screenshots of your development
2. **OpenVision** analyzes them with AI
3. Get instant feedback on your UI/UX

This combo is perfect for:
- 🎨 **Design reviews** - "How does this page look?"
- 🐛 **Bug detection** - "What's wrong with this layout?"
- ♿ **Accessibility audits** - "Check this for accessibility issues"
- 📱 **Responsive testing** - "How does this look on mobile?"
- 🎯 **UX feedback** - "Is this user-friendly?"

## 📊 Cost Control

### Staying Free
- Stick to models ending in `:free`
- Free tier includes generous limits
- No surprise charges

### Monitoring Usage
- Check OpenRouter dashboard regularly
- Set up usage alerts
- Most image analysis costs pennies even on premium models

---

**🚀 Ready to get started?**

1. Run: `bun run setup-openvision`
2. Get your free API key
3. Start analyzing your designs with AI! 