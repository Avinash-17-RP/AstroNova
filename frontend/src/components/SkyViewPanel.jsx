import { useEffect, useState } from 'react';
import { useAppStore } from '../context/store';

const SkyViewPanel = () => {
  const { isSkyViewMode, userLocation, satellites, bodiesData, issData, moonData } = useAppStore();
  const [visibleObjects, setVisibleObjects] = useState({
    planets: [],
    satellites: [],
    constellations: [],
    moon: null,
  });

  useEffect(() => {
    if (!isSkyViewMode) return;

    const visible = {
      planets: [],
      satellites: [],
      constellations: [
        'Orion', 'Ursa Major', 'Ursa Minor', 'Cassiopeia',
        'Cygnus', 'Lyra', 'Aquila', 'Perseus', 'Andromeda',
      ],
      moon: null,
    };

    // Add Moon data
    if (moonData) {
      visible.moon = {
        phase: moonData.illumination?.fraction 
          ? (moonData.illumination.fraction * 100).toFixed(1) 
          : 'Unknown',
        distance: moonData.distance?.km 
          ? (moonData.distance.km / 1000).toFixed(0) 
          : 'Unknown',
      };
    }

    // Add visible planets from astronomy data
    if (bodiesData) {
      // Handle different possible data structures
      const bodies = bodiesData.bodies || bodiesData.data?.bodies || [];
      if (Array.isArray(bodies)) {
        bodies.forEach((body) => {
          if (body.name && (body.altitude > 0 || body.visible)) {
            visible.planets.push({
              name: body.name,
              altitude: Math.round(body.altitude || 0),
              azimuth: body.azimuth ? Math.round(body.azimuth) : 'N/A',
              distance: body.distance || 'Unknown',
            });
          }
        });
      }
    }

    // Add satellites above horizon
    if (satellites && satellites.length > 0) {
      satellites.slice(0, 10).forEach((sat) => {
        const altitude = sat.satalt || 0;
        if (altitude > 0) {
          visible.satellites.push({
            name: sat.satname || 'Unknown Satellite',
            altitude: Math.round(altitude),
            category: sat.satcat || 'other',
          });
        }
      });
    }

    // Add ISS if overhead
    if (issData?.positions?.[0]) {
      const pos = issData.positions[0];
      const altitude = pos.satalt || 0;
      if (altitude > 0) {
        visible.satellites.unshift({
          name: 'ISS 🚀',
          altitude: Math.round(altitude),
          category: 'iss',
        });
      }
    }

    setVisibleObjects(visible);
  }, [isSkyViewMode, bodiesData, satellites, issData, moonData]);

  if (!isSkyViewMode) return null;

  return (
    <div className="fixed top-0 right-0 h-screen w-96 p-4 flex flex-col gap-3 pointer-events-none overflow-y-auto">
      {/* Sky View Title */}
      <div className="glass p-5 pointer-events-auto rounded-lg">
        <h2 className="text-2xl font-bold text-neon-purple mb-2">🌌 SKY VIEW</h2>
        <p className="text-xs text-gray-400">Looking up from your location</p>
      </div>

      {/* Moon */}
      {visibleObjects.moon && (
        <div className="glass p-4 pointer-events-auto">
          <h3 className="text-sm font-bold text-neon-yellow mb-2">🌙 Moon</h3>
          <div className="space-y-1 text-xs text-gray-300">
            <p>Phase: <span className="text-neon-yellow font-semibold">{visibleObjects.moon.phase}%</span></p>
            <p>Distance: <span className="text-neon-yellow font-semibold">{visibleObjects.moon.distance} 1000km</span></p>
          </div>
        </div>
      )}

      {/* Visible Planets */}
      {visibleObjects.planets.length > 0 && (
        <div className="glass p-4 pointer-events-auto">
          <h3 className="text-sm font-bold text-neon-blue mb-2">🪐 Visible Planets</h3>
          <div className="space-y-2">
            {visibleObjects.planets.map((planet, idx) => (
              <div key={idx} className="glass-sm p-2 text-xs">
                <p className="font-semibold text-neon-blue">{planet.name}</p>
                <p className="text-gray-400">
                  Altitude: {planet.altitude}° | Azimuth: {planet.azimuth}°
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overhead Satellites */}
      {visibleObjects.satellites.length > 0 && (
        <div className="glass p-4 pointer-events-auto">
          <h3 className="text-sm font-bold text-neon-cyan mb-2">🛰️ Satellites Overhead</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {visibleObjects.satellites.map((sat, idx) => (
              <div key={idx} className="glass-sm p-2 text-xs border-l-2 border-neon-cyan">
                <p className="font-semibold text-neon-cyan">{sat.name}</p>
                <p className="text-gray-400">Altitude: {sat.altitude} km</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constellations */}
      {visibleObjects.constellations.length > 0 && (
        <div className="glass p-4 pointer-events-auto">
          <h3 className="text-sm font-bold text-neon-purple mb-2">✨ Constellations</h3>
          <div className="flex flex-wrap gap-2">
            {visibleObjects.constellations.map((const_, idx) => (
              <span 
                key={idx} 
                className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-1 rounded border border-neon-purple/30"
              >
                {const_}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="glass p-3 pointer-events-auto text-xs text-gray-400 sticky bottom-0">
        <p>💡 Rotate your mouse to explore the sky. Click "Globe View" to return.</p>
      </div>
    </div>
  );
};

export default SkyViewPanel;
