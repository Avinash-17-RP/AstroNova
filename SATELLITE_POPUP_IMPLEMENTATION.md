# Satellite Popup Implementation Guide

## Overview
This document describes the satellite interactive popup feature that allows users to click on satellite markers in the 3D globe to view detailed information about them.

## Features Implemented

### 1. **Satellite Click Detection**
- **Location**: `frontend/src/components/Globe.jsx`
- **Handler**: LEFT_CLICK event listener on Cesium viewer
- **Behavior**: When a satellite marker is clicked, the satellite data is extracted and passed to the store

```javascript
// Click handler in Globe.jsx
viewer.screenSpaceEventHandler.setInputAction((click) => {
  const picked = viewer.scene.pick(click.position);
  if (picked?.id?.satelliteData) {
    setSelectedSatellite(picked.id.satelliteData);
    console.log('Selected satellite:', picked.id.satelliteData.satname);
  }
}, ScreenSpaceEventType.LEFT_CLICK);
```

### 2. **Satellite Data Storage**
- **In Entities**: Each satellite entity now stores its data directly via `satelliteData` property
- **Data Includes**: 
  - `satname`: Satellite name
  - `satid`: NORAD ID
  - `satlat`, `satlng`: Current latitude/longitude
  - `satalt`: Altitude in km
  - `velocity`: Orbital velocity
  - `inclination`: Orbital inclination
  - `category`: Satellite category

### 3. **State Management**
- **Store**: `frontend/src/context/store.js`
- **State Variables**:
  - `selectedSatellite`: Currently selected satellite data (or null)
  - `setSelectedSatellite(data)`: Function to set/clear selected satellite

### 4. **Popup Component**
- **Location**: `frontend/src/components/SatelliteInfoPopup.jsx`
- **Features**:
  - Modal overlay with satellite information
  - Displays: Name, NORAD ID, Position, Altitude, Velocity, Inclination, Category
  - External Links: N2YO, Wikipedia
  - Close button (X) and backdrop click to dismiss
  - Last update timestamp

### 5. **App Integration**
- **Location**: `frontend/src/App.jsx`
- **Integration**:
  ```javascript
  // Import
  import SatelliteInfoPopup from './components/SatelliteInfoPopup';
  
  // State destructuring
  const { selectedSatellite, setSelectedSatellite } = useAppStore();
  
  // Conditional render
  {selectedSatellite && (
    <SatelliteInfoPopup
      satellite={selectedSatellite}
      onClose={() => setSelectedSatellite(null)}
    />
  )}
  ```

## Supported Satellites

### Regular Satellites
- All satellites fetched from N2YO API
- Categories: ISS, Starlink, GPS, Weather, Communication, All
- Clickable for detailed information

### International Space Station (ISS)
- **Special Data**: Always includes full details even in sky view
- **NORAD ID**: 25544
- **Name**: "ISS (International Space Station)"
- **Orbital Inclination**: 51.6°
- **Altitude**: ~408 km

## User Interaction Flow

1. **User sees satellite markers** on the 3D globe or in any view mode
2. **User clicks on satellite marker** (single left-click)
3. **Popup appears** showing satellite information with external links
4. **User can**:
   - Click N2YO link to see detailed tracking info
   - Click Wikipedia link to read about the satellite
   - Click X button to close popup
   - Click outside popup (backdrop) to dismiss

## API Integration

### Backend Configuration
- **File**: `backend/src/config/env.js`
- **Variables**: N2YO_API_KEY, NASA_API_KEY, etc.
- **Purpose**: All API keys loaded from environment variables (never exposed to frontend)

### Public Configuration Endpoint
- **Route**: `GET /api/config/public`
- **File**: `backend/src/routes/config.js`
- **Purpose**: Provides safe public configuration without API keys
- **Returns**: Environment and API status only

### Satellite Data Flow
1. Frontend requests satellites via `/api/satellites` endpoints
2. Backend uses N2YO API with secure API key
3. Data returned to frontend with satellite details
4. Frontend stores in Zustand store
5. Globe renders satellite markers with data attached
6. Click handler passes data to popup component

## Technical Details

### Entity Structure
```javascript
{
  id: 'sat-{satid}',
  satelliteData: {
    satname: string,
    satid: number,
    satlat: number,
    satlng: number,
    satalt: number,
    velocity: number,
    inclination: number,
    category: string,
    // ... other N2YO response fields
  },
  position: Cartesian3,
  point: { /* styling */ },
  label: { /* text label */ }
}
```

### State Management Flow
```
Globe.jsx (click)
  ↓
setSelectedSatellite(satelliteData)
  ↓
Store (Zustand)
  ↓
App.jsx (conditional render)
  ↓
SatelliteInfoPopup.jsx (display)
```

## Environment Variables

### Backend (.env file)
```
N2YO_API_KEY=your_n2yo_api_key_here
NASA_API_KEY=your_nasa_api_key_here
ASTRONOMY_APP_ID=your_astronomy_app_id_here
ASTRONOMY_APP_SECRET=your_astronomy_app_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (.env file)
```
VITE_API_URL=http://localhost:5000/api
VITE_CESIUM_ION_TOKEN=optional_cesium_token
```

## Testing Checklist

- [ ] Click on satellite markers - popup should appear
- [ ] Verify popup shows correct satellite name
- [ ] Verify popup shows NORAD ID
- [ ] Verify popup shows position (lat/lng)
- [ ] Verify popup shows altitude in km
- [ ] Verify popup shows velocity
- [ ] Verify popup shows orbital inclination
- [ ] Click N2YO link - should open www.n2yo.com/satellite/?s={satid}
- [ ] Click Wikipedia link - should search for satellite name
- [ ] Click X button - popup should close
- [ ] Click outside popup - popup should close (if backdrop dismissal enabled)
- [ ] Click on ISS - popup should show ISS information
- [ ] Test in sky view mode - ISS popup should still work
- [ ] Test with different satellite categories

## Files Modified

1. **frontend/src/components/Globe.jsx**
   - Added `satelliteData` property to all satellite entities
   - Added `satelliteData` property to ISS entity
   - Implemented LEFT_CLICK event handler for popup trigger
   - Added logging for debugging

2. **frontend/src/App.jsx**
   - Added SatelliteInfoPopup import
   - Added selectedSatellite and setSelectedSatellite to store destructuring
   - Conditionally render SatelliteInfoPopup with onClose callback

3. **frontend/src/components/SatelliteInfoPopup.jsx**
   - Complete popup component with all features (already implemented)

4. **frontend/src/context/store.js**
   - Added selectedSatellite state (already implemented)
   - Added setSelectedSatellite function (already implemented)

## Security Considerations

- ✅ API keys never exposed in frontend code
- ✅ API keys never sent to client browser
- ✅ Public config endpoint doesn't expose credentials
- ✅ `.env` files not committed to Git
- ✅ `.env.example` contains only placeholders
- ✅ All external API calls go through secure backend

## Troubleshooting

### Popup doesn't appear when clicking satellite
1. Check browser console for errors
2. Verify `setSelectedSatellite` is in scope in Globe.jsx
3. Check that satellite has `satelliteData` property
4. Verify SatelliteInfoPopup is imported in App.jsx

### External links don't work
1. Check N2YO link format: `www.n2yo.com/satellite/?s={satid}`
2. Verify Wikipedia link opens search correctly
3. Check browser popup blocker settings

### Satellite data incomplete
1. Verify backend API is returning full data structure
2. Check network tab in browser dev tools
3. Verify satellite service is calling correct endpoint

### Performance issues with many satellites
1. Globe.jsx limits display to 30 satellites (adjustable)
2. Consider reducing satellite count if needed
3. Check browser performance monitor for memory leaks

## Future Enhancements

- [ ] Add hover effects to highlight satellite on hover
- [ ] Add drag-to-camera-focus functionality
- [ ] Add satellite orbit history visualization
- [ ] Add predicted pass times in popup
- [ ] Add satellite collision warning
- [ ] Add favorite satellites list
- [ ] Add satellite search functionality
- [ ] Add multi-select for comparing satellites

## References

- N2YO API: https://www.n2yo.com/api/
- Cesium.js Documentation: https://cesium.com/learn/cesiumjs/
- React/Zustand State Management: https://zustand-demo.vercel.app/
