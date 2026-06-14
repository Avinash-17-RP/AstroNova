import { X, ExternalLink } from 'lucide-react';

const SatelliteInfoPopup = ({ satellite, onClose }) => {
  if (!satellite) return null;

  const getWikipediaLink = (name) => {
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
  };

  const getN2YOLink = (satId) => {
    return `https://www.n2yo.com/satellite/?s=${satId}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-auto z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass rounded-lg p-6 max-w-md w-96 shadow-2xl border border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Satellite Icon & Name */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-neon-blue mb-2 pr-8">
            🛰️ {satellite.satname || 'Unknown Satellite'}
          </h2>
          <p className="text-xs text-gray-400">
            NORAD ID: <span className="text-neon-cyan font-mono">{satellite.satid || 'N/A'}</span>
          </p>
        </div>

        {/* Position Information */}
        <div className="space-y-3 mb-4">
          <div className="bg-white/5 p-3 rounded border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Position</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Latitude</p>
                <p className="text-neon-blue font-mono">{(satellite.satlat || 0).toFixed(2)}°</p>
              </div>
              <div>
                <p className="text-gray-500">Longitude</p>
                <p className="text-neon-blue font-mono">{(satellite.satlng || 0).toFixed(2)}°</p>
              </div>
            </div>
          </div>

          {/* Altitude */}
          <div className="bg-white/5 p-3 rounded border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Altitude</p>
            <p className="text-lg font-semibold text-neon-cyan">
              {Math.round(satellite.satalt || 0).toLocaleString()} km
            </p>
          </div>

          {/* Velocity (if available) */}
          {satellite.satvel && (
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Velocity</p>
              <p className="text-lg font-semibold text-neon-purple">
                {satellite.satvel.toFixed(2)} km/s
              </p>
            </div>
          )}

          {/* Inclination (if available) */}
          {satellite.inclination && (
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Orbital Inclination</p>
              <p className="text-lg font-semibold text-neon-purple">
                {satellite.inclination.toFixed(2)}°
              </p>
            </div>
          )}

          {/* Satellite Category */}
          {satellite.satcat && (
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Category</p>
              <p className="text-neon-yellow capitalize">
                {satellite.satcat.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </div>

        {/* External Links */}
        <div className="space-y-2 mb-4">
          <a
            href={getN2YOLink(satellite.satid)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue px-4 py-2 rounded transition-colors text-sm font-semibold"
          >
            View on N2YO
            <ExternalLink size={14} />
          </a>
          <a
            href={getWikipediaLink(satellite.satname)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple px-4 py-2 rounded transition-colors text-sm font-semibold"
          >
            Learn on Wikipedia
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors text-sm font-semibold"
        >
          Close
        </button>

        {/* Info Note */}
        <p className="text-xs text-gray-500 text-center mt-3">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default SatelliteInfoPopup;
