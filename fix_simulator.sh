#!/bin/bash

# Fix Xcode Simulator "Application failed preflight checks" error

echo "🛑  Closing Simulator app..."
killall Simulator 2>/dev/null

echo "💤  Shutting down all simulators..."
xcrun simctl shutdown all

echo "🧹  Erasing specific simulator (F85CE03A-3834-4AD3-9B12-7B6D28FAECE2) to be safe..."
xcrun simctl erase F85CE03A-3834-4AD3-9B12-7B6D28FAECE2 2>/dev/null
# Fallback to erase all if the specific ID fails or if we want a deep clean
# xcrun simctl erase all 

echo "🗑️  Cleaning DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/WeMeal-*

echo "✅  Cleanup complete. Please restart Xcode and try running the app again."
