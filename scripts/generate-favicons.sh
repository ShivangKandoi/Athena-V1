#!/bin/bash

# This script helps generate favicon files from SVG logos
# Requirements: Install Inkscape or another SVG to PNG converter

# Create the icons directory if it doesn't exist
mkdir -p public/icons

# Generate icons from the SVG
echo "Generating icons from SVG..."

# Using Inkscape (if available)
if command -v inkscape &> /dev/null; then
    echo "Using Inkscape to convert SVGs..."
    
    # Generate icon-192x192.png
    inkscape --export-filename=public/icons/icon-192x192.png -w 192 -h 192 public/assets/logos/athena-icon.svg
    
    # Generate icon-512x512.png
    inkscape --export-filename=public/icons/icon-512x512.png -w 512 -h 512 public/assets/logos/athena-icon.svg
    
    # Generate favicon.ico (16x16)
    inkscape --export-filename=public/favicon.ico -w 32 -h 32 public/assets/logos/athena-icon.svg
    
    # Generate Apple touch icon
    inkscape --export-filename=public/apple-touch-icon.png -w 180 -h 180 public/assets/logos/athena-icon.svg
    
    # Generate shortcut icons
    inkscape --export-filename=public/icons/health-shortcut.png -w 192 -h 192 public/assets/logos/athena-icon.svg
    inkscape --export-filename=public/icons/finance-shortcut.png -w 192 -h 192 public/assets/logos/athena-icon.svg
    inkscape --export-filename=public/icons/planner-shortcut.png -w 192 -h 192 public/assets/logos/athena-icon.svg
    
    echo "Icons generated successfully!"
else
    echo "Inkscape not found. Please install Inkscape or use another tool to convert the SVG files to PNG."
    echo "Convert the following files manually:"
    echo "- public/assets/logos/athena-icon.svg → public/icons/icon-192x192.png (192x192)"
    echo "- public/assets/logos/athena-icon.svg → public/icons/icon-512x512.png (512x512)"
    echo "- public/assets/logos/athena-icon.svg → public/favicon.ico (32x32)"
    echo "- public/assets/logos/athena-icon.svg → public/apple-touch-icon.png (180x180)"
    echo "- public/assets/logos/athena-icon.svg → public/icons/health-shortcut.png (192x192)"
    echo "- public/assets/logos/athena-icon.svg → public/icons/finance-shortcut.png (192x192)"
    echo "- public/assets/logos/athena-icon.svg → public/icons/planner-shortcut.png (192x192)"
fi

echo "Done!" 