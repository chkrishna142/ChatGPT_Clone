#!/bin/bash

echo "🎨 Fixing CSS issues in Galaxy Chat..."

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear browser cache (instructions)
echo "🌐 Clear browser cache:"
echo "  - Chrome/Edge: Ctrl+Shift+R (Cmd+Shift+R on Mac)"
echo "  - Firefox: Ctrl+F5 (Cmd+Shift+R on Mac)"
echo "  - Safari: Cmd+Option+R"

# Restart development server
echo "🚀 Restart development server:"
echo "  - Stop current server (Ctrl+C)"
echo "  - Run: npm run dev"

echo "✅ CSS fix steps completed!"
echo ""
echo "💡 If issues persist:"
echo "  1. Hard refresh browser (Ctrl+Shift+R)"
echo "  2. Open DevTools > Network > Disable cache"
echo "  3. Check for console errors"
