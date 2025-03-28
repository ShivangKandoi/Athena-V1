# Athena Assets Guide

This guide explains how to use the logo, favicon, and avatar assets that have been created for the Athena application.

## Logo Files

The logo files are located in the `public/assets/logos/` directory:

- `athena-logo.svg` - The full Athena logo with detailed styling
- `athena-icon.svg` - A simplified version of the logo for small displays and favicon use

## Favicon Files

To generate the favicon files from the SVG source:

1. Run the provided script: `./scripts/generate-favicons.sh`
2. This will create the necessary favicon files in the `public/icons/` directory

If you don't have Inkscape installed, you'll need to manually convert the SVG files to the required formats as detailed in the script.

The favicon files used by the application include:

- `public/favicon.ico` - Main favicon file for browsers
- `public/icons/icon-192x192.png` - Used for PWA and manifest
- `public/icons/icon-512x512.png` - Used for PWA and manifest
- `public/apple-touch-icon.png` - Used for iOS devices

## Avatar Files

The avatar files are located in the `public/assets/avatars/` directory:

- `avatar-1.svg` - "Cool Shades" avatar with sunglasses
- `avatar-2.svg` - "Green Headphones" avatar with headphones
- `avatar-3.svg` - "Cyber Style" avatar with futuristic elements
- `avatar-4.svg` - "Geometric" avatar with pastel geometric styling

## Using the Avatar Selector Component

A ready-to-use avatar selector component has been created at `src/components/avatar-selector.tsx`.

Example usage:

```tsx
import { AvatarSelector } from "@/components/avatar-selector";

export default function ProfilePage() {
  const handleAvatarSelect = (avatarUrl: string) => {
    // Update user avatar in your system
    console.log("Selected avatar:", avatarUrl);
  };
  
  return (
    <div>
      <h1>Your Profile</h1>
      <AvatarSelector 
        currentAvatarUrl="/assets/avatars/avatar-1.svg"
        onSelect={handleAvatarSelect}
      />
    </div>
  );
}
```

## Integration with Manifest

The `public/manifest.json` file already references icon paths. After generating the icon files, these should work correctly for PWA functionality.

## Design Details

- Primary Color: Purple (#8B5CF6)
- Logo represents the "A" from Athena with elements inspired by Greek design
- Avatars follow a modern, Gen Z-inspired aesthetic with vibrant colors and abstract designs 