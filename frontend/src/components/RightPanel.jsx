import { useState, useEffect } from 'react';
import { Moon, Star, AlertCircle } from 'lucide-react';
import { useAppStore } from '../context/store';
import NASAService from '../services/NASAService';

const RightPanel = () => {
  const { moonData, planetData, apodData } = useAppStore();
  const [apod, setApod] = useState(null);
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch APOD on mount
  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        setLoading(true);
        const response = await NASAService.getAPOD();
        setApod(response.data);
      } catch (error) {
        console.error('Failed to fetch APOD:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAPOD();
  }, []);

  return (
    <div className="absolute right-0 top-0 h-full w-96 p-4 flex flex-col gap-4 pointer-events-none">
      {/* Moon Card */}
      <div className="glass p-6 pointer-events-auto">
        <h3 className="text-xl font-bold text-neon-purple mb-4 flex items-center gap-2">
          <Moon size={20} />
          Moon
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-400">Phase</p>
            <p className="text-neon-purple font-semibold">Waxing Gibbous</p>
          </div>
          <div>
            <p className="text-gray-400">Illumination</p>
            <p className="text-neon-purple font-semibold">78%</p>
          </div>
          <div>
            <p className="text-gray-400">Distance</p>
            <p className="text-neon-purple font-semibold">384,400 km</p>
          </div>
        </div>
      </div>

      {/* Planets Card */}
      <div className="glass p-6 pointer-events-auto">
        <h3 className="text-lg font-bold text-neon-blue mb-4 flex items-center gap-2">
          <Star size={18} />
          Visible Planets
        </h3>
        <div className="space-y-3 text-sm">
          {['Venus', 'Mars', 'Jupiter', 'Saturn'].map((planet) => (
            <div key={planet} className="glass-sm p-2">
              <p className="font-semibold text-neon-blue">{planet}</p>
              <p className="text-gray-400 text-xs">Visible - Alt: 45°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Asteroids Card */}
      <div className="glass p-6 pointer-events-auto">
        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          Near-Earth Objects
        </h3>
        <div className="space-y-2 text-sm">
          <div className="glass-sm p-3">
            <p className="font-semibold text-red-400">2024 BX</p>
            <p className="text-gray-400 text-xs">Distance: 0.05 AU</p>
          </div>
          <div className="glass-sm p-3">
            <p className="font-semibold text-red-400">2024 GJ</p>
            <p className="text-gray-400 text-xs">Distance: 0.12 AU</p>
          </div>
        </div>
      </div>

      {/* APOD Card */}
      <div className="glass p-6 pointer-events-auto flex-1 overflow-y-auto">
        <h3 className="text-lg font-bold text-neon-blue mb-3">📸 APOD</h3>
        
        {loading ? (
          <p className="text-gray-400 text-sm">Loading APOD...</p>
        ) : apod ? (
          <div>
            {apod.media_type === 'image' && (
              <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                className="w-full h-auto rounded-lg mb-3 object-cover max-h-48"
              />
            )}
            <h4 className="font-semibold text-neon-blue text-sm mb-2">{apod.title}</h4>
            <p className="text-gray-400 text-xs line-clamp-3">{apod.explanation}</p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No APOD available</p>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
