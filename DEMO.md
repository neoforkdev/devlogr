# 🚀 DevLogr Quick Demo

A comprehensive yet concise demonstration of DevLogr's key features.

## Running the Demo

### Single Demo Run
```bash
npm run example:demo
```

### Complete Multi-Mode Demo
```bash
npm run demo
```

## What's Demonstrated

### 🎨 **Log Levels & Styling**
- ✅ Success messages with positive styling
- ℹ️ Info messages for general information  
- ⚠️ Warning messages for attention-needed items
- ❌ Error messages with error styling
- 📝 Task messages for work-in-progress
- 🐛 Debug messages (only visible with debug level)

### 🌀 **Interactive Spinners**
- Basic spinner with completion
- Multi-step spinner with text updates
- Error handling scenarios
- Different completion states (success, error, warning, info)

### 📊 **Data Logging**
- Simple and complex object logging
- Formatted output with placeholders
- Plain text without styling
- Structured data display

### ⚙️ **Output Modes**
- **Default**: Full visual styling with colors and emojis
- **JSON Mode**: Machine-readable structured output (`DEVLOGR_OUTPUT_JSON=true`)
- **CI Mode**: Color-free output for CI/CD (`NO_COLOR=1`)
- **Debug Mode**: Shows all log levels including debug (`DEVLOGR_LOG_LEVEL=debug`)

## Environment Variable Examples

```bash
# JSON output for machine parsing
DEVLOGR_OUTPUT_JSON=true npm run example:demo

# CI-friendly (no colors)
NO_COLOR=1 npm run example:demo

# Enable debug messages
DEVLOGR_LOG_LEVEL=debug npm run example:demo

# Disable emojis
NO_EMOJI=1 npm run example:demo

# Multiple options
DEVLOGR_OUTPUT_JSON=true DEVLOGR_LOG_LEVEL=debug npm run example:demo
```

## Demo Duration

The complete demo runs for approximately **15 seconds** and showcases all major features in a realistic scenario that mimics real CLI tool usage.

Perfect for:
- 👀 Quick feature overview
- 🧪 Testing environment configurations  
- 📹 Recording demonstrations
- 🎓 Learning the API quickly 