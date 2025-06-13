#!/bin/bash

echo "🧹 Cleaning up unused files..."

# Remove known unnecessary files
rm -f session/.gitkeep
rm -f session/server.js
rm -f session/frontend/index.js

echo "✅ Cleanup complete."
