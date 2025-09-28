# Assets Folder

This folder contains all the media assets for your Sample It app.

## Directory Structure

```
assets/
├── samples/
│   ├── videos/          # Place your MP4 video files here
│   └── audio/           # Place your MP3 audio files here
└── README.md           # This file
```

## Adding Your Samples

### Video Files
- Place your MP4 video files in `assets/samples/videos/`
- Recommended format: MP4, H.264 codec
- Recommended resolution: 1080x1920 (9:16 aspect ratio for mobile)
- Example: `sample1.mp4`, `sample2.mp4`, etc.

### Audio Files
- Place your MP3 audio files in `assets/samples/audio/`
- Recommended format: MP3, 320kbps
- Example: `sample1.mp3`, `sample2.mp3`, etc.

### File Naming Convention
Use consistent naming for matching video/audio pairs:
- `sample1.mp4` + `sample1.mp3`
- `sample2.mp4` + `sample2.mp3`
- etc.

## Usage in Code

The app will automatically load files from these directories. Update the `sampleData` array in `MainScreen.tsx` to reference your actual files:

```javascript
{
  id: '1',
  videoUri: require('../assets/samples/videos/sample1.mp4'),
  audioUri: require('../assets/samples/audio/sample1.mp3'),
  artist: 'Your Artist',
  songName: 'Your Song',
  genre: 'Your Genre',
}
```

## File Size Recommendations

- **Videos**: Keep under 50MB per file for good performance
- **Audio**: Keep under 10MB per file
- **Total assets**: Consider the app bundle size for distribution

## Supported Formats

- **Videos**: MP4 (H.264), MOV
- **Audio**: MP3, AAC, WAV

## Git Considerations

Add large media files to `.gitignore` if they're not essential for development:

```
assets/samples/videos/*.mp4
assets/samples/audio/*.mp3
```

Or use Git LFS for large files.
