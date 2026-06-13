# AstroNova 🚀🌍
## Real-Time Space Awareness Platform

A modern full-stack web application that combines live satellite tracking, astronomy data, asteroid monitoring, and AI-powered sky explanations. Experience a professional space operations dashboard merged with a planetarium.

## 🎯 Features 

### 1. **Hero Experience** 
- Realistic 3D Earth floating in space using CesiumJS
- Dynamic Earth rotation with smooth camera movement 
- Professional space-themed appearance with starfield background
- Landing sequence with automated camera rotation

### 2. **Locate Me**
- Browser geolocation integration (like Google Maps)
- Display latitude, longitude, and city name
- Smooth camera flight to user location
- Blue marker showing your position with approximate radius

### 3. **Live Satellite Tracking**
- Track ISS in real-time
- Starlink constellation monitoring
- GPS satellite positions
- Updates every 30 seconds
- Display satellite markers on globe with names and positions

### 4. **Orbit Visualization**
- ISS orbit path rendering
- Starlink orbit visualization
- Future trajectory lines
- Naturally wrapping polylines around Earth

### 5. **Satellites Above You**
- Real-time list of satellites overhead
- Display satellite names, altitude, and category
- Interactive satellite details panel

### 6. **ISS Visibility**
- Next ISS visible pass calculations
- Start time, end time, and duration
- Visibility quality indicators

### 7. **Astronomy Dashboard**
- **Moon Data**: Phase, distance, direction, altitude
- **Planets**: Mercury, Venus, Mars, Jupiter, Saturn
- Visibility status, direction, altitude, constellation info for each
- Constellation information

### 8. **Sky View Mode**
- Camera moves to user location
- Tilt upward for sky-looking perspective
- Realistic space view experience
- Moon, planets, ISS, and satellite markers

### 9. **NASA Integration**
- Near-Earth objects data
- Asteroid threat indicators
- Astronomy Picture of the Day (APOD)
- Title, description, and HD image display

### 10. **AI Assistant (Gemini-Powered)**
- Answer questions like "What can I see tonight?"
- "Is the ISS visible?"
- "Tell me about Venus"
- "Explain this satellite"
- Contextual natural-language explanations

### 11. **UI/UX**
- Dark mode with space aesthetic
- Blue and purple neon highlights
- Glassmorphism design pattern
- **Layout**:
  - Left Panel: User info, satellites above, ISS visibility
  - Center: Cesium 3D globe
  - Right Panel: Moon, planets, asteroids, APOD
  - Bottom: AI assistant chat

## 🛠️ Tech Stack

### Frontend
- **React** 18.2 + Vite (fast development)
- **Tailwind CSS** - Utility-first styling
- **CesiumJS** - 3D globe engine
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** + **Express** - REST API server
- **Axios** - HTTP requests to external APIs
- **Cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** or **yarn**
- Modern web browser with WebGL support
- API Keys for:
  - N2YO (Satellite Tracking)
  - NASA (Space Data)
  - Astronomy API (Astronomy Data)
  - Google Gemini (AI)
  - Cesium Ion (3D Globe)

## 🚀 Setup Instructions

### 1. Get API Keys

#### N2YO (Satellite Tracking)
https://www.n2yo.com/api/
- Sign up for free account
- Get your API key

#### NASA API
https://api.nasa.gov/
- Sign up for free account
- Receive API key instantly

#### Astronomy API
https://www.astronomyapi.com/
- Create account
- Get App ID and App Secret


#### Google Gemini API

https://makersuite.google.com/app/apikey
- Create API key for Gemini


#### Cesium Ion (Optional - for advanced features)

https://ion.cesium.com/
- Create free account
- Get Cesium Ion access token


### 2. Clone or Download Project

```bash
cd AstroNova
```

### 3. Backend Setup

bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env and add your API keys
# REQUIRED:
# - N2YO_API_KEY
# - NASA_API_KEY
# - ASTRONOMY_APP_ID
# - ASTRONOMY_APP_SECRET
# - GEMINI_API_KEY

# Start backend (development mode)
npm run dev

# Or production mode
npm start


Backend runs on: `http://localhost:5000`

### 4. Frontend Setup

bash
cd frontend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env and add Cesium Ion token (optional)
# VITE_CESIUM_ION_TOKEN=your_token_here
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview


Frontend runs on: `http://localhost:5173`

## 📁 Project Structure


AstroNova/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Globe.jsx       # CesiumJS globe
│   │   │   ├── LeftPanel.jsx   # User location & satellites
│   │   │   ├── RightPanel.jsx  # Moon, planets, asteroids
│   │   │   └── AIAssistant.jsx # AI chat interface
│   │   ├── services/            # API service classes
│   │   │   ├── api.js          # Axios instance
│   │   │   ├── SatelliteService.js
│   │   │   ├── AstronomyService.js
│   │   │   ├── NASAService.js
│   │   │   └── AIService.js
│   │   ├── context/
│   │   │   └── store.js        # Zustand state store
│   │   ├── hooks/              # Custom React hooks
│   │   ├── App.jsx            # Main app component
│   │   └── index.css          # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js         # Environment config
│   │   ├── middleware/
│   │   │   ├── cors.js        # CORS configuration
│   │   │   └── errorHandler.js # Error handling
│   │   ├── routes/
│   │   │   ├── satellites.js   # Satellite endpoints
│   │   │   ├── astronomy.js    # Astronomy endpoints
│   │   │   ├── nasa.js         # NASA endpoints
│   │   │   ├── ai.js           # AI endpoints
│   │   │   └── health.js       # Health check
│   │   ├── controllers/
│   │   │   ├── satelliteController.js
│   │   │   ├── astronomyController.js
│   │   │   ├── nasaController.js
│   │   │   └── aiController.js
│   │   ├── services/
│   │   │   ├── N2YOService.js      # Satellite API
│   │   │   ├── AstronomyService.js # Astronomy API
│   │   │   ├── NASAService.js      # NASA API
│   │   │   └── GeminiService.js    # Gemini AI
│   │   └── server.js          # Express app entry
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── .gitignore
└── README.md


## 🌐 API Endpoints

### Satellites
- `GET /api/satellites/positions` - Get satellite positions
- `GET /api/satellites/above` - Get satellites above location
- `GET /api/satellites/iss-passes` - Get ISS visual passes
- `GET /api/satellites/iss-position` - Get ISS current position
- `GET /api/satellites/common` - Get common satellites

### Astronomy
- `GET /api/astronomy/moon` - Get moon data
- `GET /api/astronomy/planet` - Get planet data
- `GET /api/astronomy/bodies` - Get all celestial bodies
- `GET /api/astronomy/constellation` - Get constellation data

### NASA
- `GET /api/nasa/apod` - Astronomy Picture of the Day
- `GET /api/nasa/neo` - Near-Earth objects
- `GET /api/nasa/hazardous-asteroids` - Hazardous asteroids
- `GET /api/nasa/asteroid/:asteroidId` - Asteroid by ID

### AI
- `POST /api/ai/ask` - Ask question
- `POST /api/ai/visible-tonight` - What's visible tonight
- `POST /api/ai/explain-satellite` - Explain a satellite
- `POST /api/ai/chat` - General chat

### Health
- `GET /api/health` - Health check

## 🔒 Environment Variables

### Backend (.env)

PORT=5000
NODE_ENV=development
N2YO_API_KEY=your_key_here
NASA_API_KEY=your_key_here
ASTRONOMY_APP_ID=your_id_here
ASTRONOMY_APP_SECRET=your_secret_here
GEMINI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
CACHE_DURATION=5


### Frontend (.env)

VITE_API_URL=http://localhost:5000/api
VITE_CESIUM_ION_TOKEN=your_token_here

## 🚢 Deployment

### Frontend (Vercel)
bash
# Build
npm run build

# Deploy to Vercel
vercel


### Backend (Render)
bash
# Set environment variables in Render dashboard
# Connect repository
# Render auto-deploys from main branch


## 🔄 Real-Time Updates

- Satellites update every 30 seconds
- Astronomy data refreshes on location/date change
- ISS passes calculated dynamically
- Live WebSocket support can be added for future versions

## 🎨 Customization

### Colors
Edit `frontend/tailwind.config.js` to customize theme colors:
javascript
colors: {
  space: { 900, 800, 700, 600 },
  neon: { blue, purple, pink }
}


### API Calls
Modify service files in `frontend/src/services/` and `backend/src/services/`

### Components
Create new components in `frontend/src/components/` and add to App.jsx

## 📊 Performance Optimization

- API response caching (configurable duration)
- Lazy loading of components
- Optimized Cesium rendering
- Minimal re-renders with Zustand

## 🐛 Troubleshooting

### Cesium not loading
- Check Cesium Ion token in .env
- Verify browser WebGL support
- Check browser console for errors

### API keys not working
- Verify keys in .env files
- Check API provider status
- Ensure keys have correct permissions

### CORS errors
- Backend CORS configured in `backend/src/middleware/cors.js`
- Verify FRONTEND_URL in backend .env

### Geolocation not working
- HTTPS required for production
- User must grant permission
- Check browser geolocation settings

## 📚 API Documentation

Visit `http://localhost:5000/` when backend is running to see available endpoints.

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🙏 Acknowledgments

- **CesiumJS** - 3D geospatial visualization
- **N2YO** - Satellite tracking data
- **NASA** - Space and astronomy data
- **Astronomy API** - Astronomy calculations
- **Google Gemini** - AI capabilities
- **Tailwind CSS** - Styling framework
- **React & Vite** - Frontend framework

## 📞 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify all API keys are set correctly

## 🗺️ Roadmap

- [ ] WebSocket real-time updates
- [ ] Historical satellite tracking
- [ ] Custom alerts and notifications
- [ ] User accounts and saved locations
- [ ] Mobile responsive design
- [ ] Dark/light theme toggle
- [ ] AR mode for satellite tracking
- [ ] Multi-language support
- [ ] Advanced orbital mechanics visualization
- [ ] Event calendar for astronomical events

## 🌟 Features Coming Soon

- Satellite prediction models
- Advanced filtering options
- Custom orbit paths
- Photo capture from globe view
- Social sharing features
- API rate limiting and authentication
- Database integration for history



**Happy stargazing! 🌌**

Built with ❤️ for space enthusiasts
