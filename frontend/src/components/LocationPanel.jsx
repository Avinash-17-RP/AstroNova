import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { useAppStore } from '../context/store';

const LocationPanel = () => {
  const { userLocation, cityName, setUserLocation, setCityName } = useAppStore();

  const handleRelocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10`
          );
          const data = await resp.json();
          setCityName(data.address?.city || data.address?.town || data.address?.county || 'Unknown');
        } catch (_) { setCityName('Unknown'); }
      },
      () => {}
    );
  };

  return (
    <div className="panel-enter" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(0,217,255,0.12)',
          border: '1px solid rgba(0,217,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MapPin size={16} color="#00d9ff" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>My Location</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>GPS tracking</div>
        </div>
      </div>

      {/* City */}
      {cityName && (
        <div style={{
          background: 'rgba(0,217,255,0.08)',
          border: '1px solid rgba(0,217,255,0.15)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>CITY</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#00d9ff' }}>{cityName}</div>
        </div>
      )}

      {/* Coordinates */}
      {userLocation ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <CoordCard label="LATITUDE" value={`${userLocation.lat.toFixed(5)}°`} />
          <CoordCard label="LONGITUDE" value={`${userLocation.lng.toFixed(5)}°`} />
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 14 }}>
          No location detected
        </div>
      )}

      {/* Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'rgba(52,211,153,0.08)',
        border: '1px solid rgba(52,211,153,0.15)',
        borderRadius: 10,
        marginBottom: 16,
      }}>
        <span style={{
          display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
          background: '#34d399', boxShadow: '0 0 6px #34d399',
        }} />
        <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>
          GPS Active
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
          {userLocation ? 'Located' : 'Searching…'}
        </span>
      </div>

      {/* Relocate */}
      <button
        onClick={handleRelocate}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 0',
          borderRadius: 10,
          border: '1px solid rgba(0,217,255,0.2)',
          background: 'rgba(0,217,255,0.08)',
          color: '#00d9ff',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.04em',
          transition: 'all 0.2s',
          fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,217,255,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,217,255,0.08)'; }}
      >
        <RefreshCw size={13} />
        Refresh Location
      </button>
    </div>
  );
};

const CoordCard = ({ label, value }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: '10px 12px',
  }}>
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 5 }}>
      {label}
    </div>
    <div style={{
      fontSize: 13,
      color: '#e2e8f0',
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 600,
    }}>
      {value}
    </div>
  </div>
);

export default LocationPanel;
