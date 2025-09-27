# Sample It - React Native App

A music production app that allows users to scroll through video samples with accompanying audio, similar to TikTok but focused on music sampling and production.

## Features

- **Vertical Video Scrolling**: Swipe up/down to navigate between different music samples
- **Audio-Video Sync**: Each video sample has synchronized audio playback
- **Visualizer Background**: Animated background effects that respond to the current sample
- **Producer Controls**: Tools for sampling, chopping, pitch shifting, and more
- **Song Information**: Display artist name, song title, and additional info

## Project Structure

```
src/
├── screens/
│   └── MainScreen.tsx          # Main screen with video scrolling
├── components/
│   ├── Header.tsx              # Top header with status bar and navigation
│   ├── VideoPlayer.tsx         # Video player with audio sync
│   ├── VisualizerBackground.tsx # Animated background effects
│   └── Footer.tsx              # Bottom controls and song info
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
npm run ios
```

3. For Android:
```bash
npm run android
```

## Sample Data Structure

The app expects sample data in the following format:

```javascript
{
  id: 'unique_id',
  videoUri: 'file:///path/to/video.mp4',
  audioUri: 'file:///path/to/audio.mp3',
  artist: 'Artist Name',
  songName: 'Song Title',
  genre: 'Genre'
}
```

## Dependencies

- **react-native-video**: Video playback
- **react-native-sound**: Audio playback
- **react-native-svg**: Visualizer graphics
- **react-native-vector-icons**: UI icons
- **react-native-gesture-handler**: Touch gestures
- **react-native-reanimated**: Animations
- **react-native-safe-area-context**: Safe area handling

## Next Steps

1. Replace sample data with actual video/audio files
2. Implement producer control functionality
3. Add genre filtering and search
4. Implement save/bookmark functionality
5. Add user authentication and profiles

