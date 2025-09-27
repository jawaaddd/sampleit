# Sample It - Music Production App

A full-stack music production app with React Native frontend and FastAPI backend, all containerized with Docker.

## Architecture

- **Frontend**: React Native app with TikTok-style video scrolling
- **Backend**: FastAPI REST API for sample management
- **Infrastructure**: Docker Compose for development environment

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- React Native development environment setup (Android Studio/Xcode)

### Running the Full Stack

1. **Start all services with Docker Compose:**
```bash
docker-compose up --build
```

This will start:
- Backend API on `http://localhost:8000`
- Frontend Metro bundler on `http://localhost:8081`

2. **For React Native development:**
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies locally (for better IDE support)
npm install

# Run on Android
npm run android

# Or run on iOS
npm run ios
```

### Individual Services

**Backend only:**
```bash
docker-compose up backend
```

**Frontend Metro bundler only:**
```bash
docker-compose up frontend
```

### Development Workflow

1. The Docker containers provide the development servers
2. Use your local React Native CLI to run the app on device/simulator
3. The Metro bundler (running in Docker) will serve the JavaScript bundle
4. Hot reload works seamlessly between Docker and your device

### API Endpoints

- `GET /` - API status
- `GET /samples` - List all music samples
- `GET /health` - Health check

### Project Structure

```
sampleit/
├── docker-compose.yml          # Main orchestration
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   └── models.py          # Data models
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── screens/           # React Native screens
│   │   └── components/        # Reusable components
│   └── package.json
└── README.md
```

### Adding Media Files

1. Place your MP4 videos in `backend/static/videos/`
2. Place your MP3 audio files in `backend/static/audio/`
3. Update the sample data in `backend/app/main.py` or connect to a database

### Next Steps

- [ ] Add database integration (PostgreSQL)
- [ ] Implement file upload endpoints
- [ ] Add user authentication
- [ ] Connect frontend to backend API
- [ ] Add production deployment configuration