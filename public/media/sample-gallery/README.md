# Sample Gallery Folder

This folder demonstrates the new gallery feature for the portfolio projects.

## How to use:

1. Create a folder in `/public/media/` with your project name
2. Add images to the folder with these naming patterns:
   - Numbered: `1.jpg`, `2.jpg`, `3.jpg`, etc.
   - Named: `screenshot.jpg`, `demo.png`, `preview.jpg`, etc.
   - Supported formats: jpg, jpeg, png, webp, gif, svg

3. In your projects.json, add a media item with type "gallery":
```json
{
  "type": "gallery",
  "src": "/media/your-project-folder",
  "alt": "Your project gallery",
  "title": "Project Screenshots"
}
```

## Features:
- Instagram-style carousel with navigation arrows
- Thumbnail strip below main image
- Touch/swipe support for mobile
- Keyboard navigation (arrow keys)
- Automatic image discovery
- Fallback handling for missing images
- Image counter display

The carousel will automatically discover and display all images in the folder. 