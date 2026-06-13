import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Eye } from 'lucide-react';
import { useAppStore } from '../context/store';
import SatelliteService from '../services/SatelliteService';

const LeftPanel = () => {
  const { userLocation, setUserLocation, isSkyViewMode, setSkyViewMode, satellites } = useAppStore();
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(false);

  // Get city name from coordinates
  useEffect(() => {
    if (!userLocation) return;

    const getCity = async () => {
      try {
        // Using reverse geocoding API (you can replace with your preferred service)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`
        );
        const data = await response.json();
        setCityName(data.address?.city || data.address?.town || 'Unknown Location');
      } catch (error) {
        console.error('Geolocation error:', error);
      }
    };

    getCity();
  }, [userLocation]);

  // Handle locate me
  const handleLocateMe = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoading(false);
        }
      );
    }
  };

  // Toggle sky view mode
  const toggleSkyView = () => {
    setSkyViewMode(!isSkyViewMode);
  };

  return (
    <div className="absolute left-0 top-0 h-full w-96 p-4 flex flex-col gap-4 pointer-events-none">
      {/* User Info Card */}
      <div className="glass p-6 pointer-events-auto">
        <h2 className="text-xl font-bold text-neon-blue mb-4">📍 Your Location</h2>
        
        {userLocation ? (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400">Latitude</p>
              <p className="text-neon-blue font-mono">{userLocation.lat.toFixed(6)}°</p>
            </div>
            <div>
              <p className="text-gray-400">Longitude</p>
              <p className="text-neon-blue font-mono">{userLocation.lng.toFixed(6)}°</p>
            </div>
            {cityName && (
              <div>
                <p className="text-gray-400">City</p>
                <p className="text-neon-blue">{cityName}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Location not detected</p>
        )}

        <button
          onClick={handleLocateMe}
          disabled={loading}
          className="w-full mt-4 bg-neon-blue hover:bg-neon-blue/80 disabled:opacity-50 text-space-900 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <MapPin size={16} />
          {loading ? 'Locating...' : 'Locate Me'}
        </button>
      </div>

      {/* Sky View Toggle */}
      <div className="glass p-4 pointer-events-auto">
        <button
          onClick={toggleSkyView}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all font-semibold ${
            isSkyViewMode
              ? 'bg-neon-purple text-white'
              : 'bg-white/10 text-neon-blue hover:bg-white/20'
          }`}
        >
          <Eye size={16} />
          {isSkyViewMode ? 'Sky View' : 'Globe View'}
        </button>
      </div>

      {/* Satellites Above You */}
      <div className="glass p-6 pointer-events-auto flex-1 overflow-y-auto">
        <h3 className="text-lg font-bold text-neon-purple mb-4">🛰️ Satellites Above</h3>
        
        {satellites && satellites.length > 0 ? (
          <div className="space-y-2">
            {satellites.slice(0, 8).map((sat, idx) => (
              <div key={idx} className="glass-sm p-3 text-sm">
                <p className="font-semibold text-neon-blue">{sat.satname || 'Unknown'}</p>
                <p className="text-gray-400 text-xs">
                  Alt: {Math.round(sat.satalt || 0)} km
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Loading satellites...</p>
        )}
      </div>

      {/* ISS Visibility */}
      <div className="glass p-6 pointer-events-auto">
        <h3 className="text-lg font-bold text-neon-blue mb-3">🚀 Next ISS Pass</h3>
        <p className="text-gray-400 text-sm">Calculating next visible pass...</p>
        <p className="text-neon-blue text-sm mt-2 font-semibold">~3 hours from now</p>
      </div>
    </div>
  );
};

export default LeftPanel;
