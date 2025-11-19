# Video Files Directory

Place your video files here for the video gallery.

## File Naming Convention
- Use descriptive names: `sample-video-1.mp4`, `sample-video-2.mp4`, etc.
- Supported formats: MP4, WebM, MOV

## Example Structure
```
public/videos/
  ├── sample-video-1.mp4
  ├── sample-video-2.mp4
  ├── sample-video-3.mp4
  └── ...
```

## Current Setup
The mock data references video files as `/videos/sample-video-{id}.mp4`

In production, these URLs should point to your actual video hosting service (CDN, cloud storage, etc.)
