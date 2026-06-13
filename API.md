# API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://astronova-api.render.com/api` (example)

## Authentication
Currently no authentication required. For production, add JWT tokens to .env and middleware.

---

## 🛰️ Satellite Endpoints

### Get Satellite Positions
```
GET /satellites/positions
```
**Query Parameters:**
- `satId` (required) - Satellite ID (e.g., 25544 for ISS)
- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `alt` (optional) - Altitude in km (default: 0)
- `days` (optional) - Number of days (0-10, default: 0)

**Example:**
```bash
curl "http://localhost:5000/api/satellites/positions?satId=25544&lat=40.7128&lng=-74.0060"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "satname": "ISS (ZARYA)",
    "satid": 25544,
    "positions": [
      {
        "satlatitude": 40.5,
        "satlongitude": -73.8,
        "sataltitude": 420,
        "azimuth": 120.5,
        "elevation": 45.2,
        "ra": 15.25,
        "dec": 30.15,
        "range": 500,
        "timestamp": 1234567890
      }
    ]
  }
}
```

### Get Satellites Above Location
```
GET /satellites/above
```
**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `alt` (optional) - Altitude in km (default: 0)
- `radius` (optional) - Search radius in km (default: 90)
- `limit` (optional) - Max results (default: 10)

**Example:**
```bash
curl "http://localhost:5000/api/satellites/above?lat=40.7128&lng=-74.0060&limit=20"
```

### Get ISS Visual Passes
```
GET /satellites/iss-passes
```
**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `alt` (optional) - Altitude in km (default: 0)
- `days` (optional) - Number of days to check (default: 10)
- `minVisibility` (optional) - Minimum visibility in seconds (default: 300)

**Example:**
```bash
curl "http://localhost:5000/api/satellites/iss-passes?lat=40.7128&lng=-74.0060&days=10"
```

### Get ISS Current Position
```
GET /satellites/iss-position
```
**Query Parameters:**
- `lat` (optional) - Latitude (default: 0)
- `lng` (optional) - Longitude (default: 0)
- `alt` (optional) - Altitude in km (default: 0)

### Get Common Satellites
```
GET /satellites/common
```
**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude

---

## 🌙 Astronomy Endpoints

### Get Moon Data
```
GET /astronomy/moon
```
**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `date` (required) - Date in YYYY-MM-DD format

**Example:**
```bash
curl "http://localhost:5000/api/astronomy/moon?lat=40.7128&lng=-74.0060&date=2024-01-15"
```

### Get Planet Data
```
GET /astronomy/planet
```
**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `date` (required) - Date in YYYY-MM-DD format
- `planet` (required) - Planet name: mercury, venus, mars, jupiter, saturn

**Example:**
```bash
curl "http://localhost:5000/api/astronomy/planet?lat=40.7128&lng=-74.0060&date=2024-01-15&planet=mars"
```

### Get All Celestial Bodies
```
GET /astronomy/bodies
```
**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `date` (required) - Date in YYYY-MM-DD format

### Get Constellation Data
```
GET /astronomy/constellation
```
**Query Parameters:**
- `constellationId` (required) - Constellation identifier

---

## 🪐 NASA Endpoints

### Get Astronomy Picture of the Day
```
GET /nasa/apod
```
**Query Parameters:**
- `date` (optional) - Date in YYYY-MM-DD format

**Example:**
```bash
curl "http://localhost:5000/api/nasa/apod"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "copyright": "NASA",
    "date": "2024-01-15",
    "explanation": "...",
    "hdurl": "https://apod.nasa.gov/...",
    "media_type": "image",
    "service_version": "v1",
    "title": "Nebula Title",
    "url": "https://apod.nasa.gov/..."
  }
}
```

### Get Near-Earth Objects
```
GET /nasa/neo
```
**Query Parameters:**
- `startDate` (required) - Start date in YYYY-MM-DD format
- `endDate` (required) - End date in YYYY-MM-DD format

**Example:**
```bash
curl "http://localhost:5000/api/nasa/neo?startDate=2024-01-15&endDate=2024-01-20"
```

### Get Hazardous Asteroids
```
GET /nasa/hazardous-asteroids
```

**Example:**
```bash
curl "http://localhost:5000/api/nasa/hazardous-asteroids"
```

### Get Asteroid by ID
```
GET /nasa/asteroid/:asteroidId
```

**Example:**
```bash
curl "http://localhost:5000/api/nasa/asteroid/3542519"
```

---

## 🤖 AI Endpoints

### Ask About Space
```
POST /ai/ask
```

**Request Body:**
```json
{
  "question": "What can I see tonight?",
  "context": {
    "location": "New York",
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Tonight you should be able to see Venus in the western sky..."
  }
}
```

### Get What's Visible Tonight
```
POST /ai/visible-tonight
```

**Request Body:**
```json
{
  "astronomyData": { ... },
  "satelliteData": { ... }
}
```

### Explain a Satellite
```
POST /ai/explain-satellite
```

**Request Body:**
```json
{
  "satelliteName": "ISS",
  "satelliteData": {
    "satlatitude": 40.5,
    "satlongitude": -73.8,
    "sataltitude": 420
  }
}
```

### General Chat
```
POST /ai/chat
```

**Request Body:**
```json
{
  "message": "Tell me about Mars",
  "context": {}
}
```

---

## ❤️ Health Check

### Server Health
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "status": 400,
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request (missing parameters)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error
- `503` - Service Unavailable

---

## Rate Limiting

Current implementation has no rate limiting. For production:
1. Implement rate limiting middleware
2. Cache responses based on CACHE_DURATION
3. Add API key authentication
4. Monitor usage

---

## Frontend Integration Example

```javascript
import SatelliteService from './services/SatelliteService';

// Get ISS position
const response = await SatelliteService.getISSPosition(40.7128, -74.0060);
console.log(response.data);

// Get satellites above location
const satellites = await SatelliteService.getSatellitesAbove(40.7128, -74.0060);
console.log(satellites.data);
```

---

## Testing Endpoints

Use Postman or cURL to test:

```bash
# Health check
curl http://localhost:5000/api/health

# Get ISS position
curl "http://localhost:5000/api/satellites/iss-position?lat=0&lng=0"

# Get APOD
curl http://localhost:5000/api/nasa/apod

# Ask AI
curl -X POST http://localhost:5000/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the ISS?"}'
```

---

## API Keys Required

Make sure these are set in your backend .env:
- `N2YO_API_KEY` - For satellite data
- `NASA_API_KEY` - For space/asteroid data
- `ASTRONOMY_APP_ID` & `ASTRONOMY_APP_SECRET` - For astronomy calculations
- `GEMINI_API_KEY` - For AI responses

---

**Last Updated:** January 2024
**Version:** 1.0.0
