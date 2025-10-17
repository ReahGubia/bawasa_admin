#!/bin/bash

# BAWASA Web - Environment Setup Script

echo "🚀 Setting up BAWASA Web environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the bawasa_web directory."
    exit 1
fi

# Try different package managers
echo "📦 Installing dependencies..."

# Try yarn first
if command -v yarn &> /dev/null; then
    echo "Using yarn..."
    yarn install
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully with yarn"
    else
        echo "❌ Yarn installation failed"
    fi
else
    # Try npm with cache fix
    echo "Using npm..."
    
    # Try to fix npm cache permissions
    if [ -d "/Users/clarencevega/.npm" ]; then
        echo "Fixing npm cache permissions..."
        sudo chown -R $(whoami) "/Users/clarencevega/.npm" 2>/dev/null || true
    fi
    
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully with npm"
    else
        echo "❌ NPM installation failed. Please try manually:"
        echo "   sudo chown -R 501:20 \"/Users/clarencevega/.npm\""
        echo "   npm install"
        exit 1
    fi
fi

echo ""
echo "🔧 Environment setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To test authentication:"
echo "  1. Navigate to http://localhost:3000/signin"
echo "  2. Use your admin credentials"
echo "  3. Verify redirect to dashboard"
echo ""
echo "📚 For more information, see SUPABASE_AUTH_SETUP.md"
