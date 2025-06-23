#!/bin/bash

echo "🚀 DevLogr Demo - Multiple Output Modes"
echo "======================================="
echo

echo "1️⃣  Normal Output (default):"
echo "----------------------------"
npm run example:demo
echo

echo "2️⃣  JSON Output Mode:"
echo "--------------------"
DEVLOGR_OUTPUT_JSON=true npm run example:demo
echo

echo "3️⃣  No Color Mode (CI-friendly):"
echo "--------------------------------"
NO_COLOR=1 npm run example:demo
echo

echo "4️⃣  Debug Level (shows debug messages):"
echo "---------------------------------------"
DEVLOGR_LOG_LEVEL=debug npm run example:demo
echo

echo "✨ Demo complete! Try these commands yourself:"
echo "   npm run example:demo"
echo "   DEVLOGR_OUTPUT_JSON=true npm run example:demo"
echo "   NO_COLOR=1 npm run example:demo"
echo "   DEVLOGR_LOG_LEVEL=debug npm run example:demo" 