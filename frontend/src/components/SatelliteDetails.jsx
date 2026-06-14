import { Crosshair, X, Bot, Zap, Compass, Calendar, Hash } from 'lucide-react';
import { useAppStore } from '../context/store';

// Earth constants for orbital speed calculation
const GM_EARTH = 398_600.4418; // km³/s²
const R_EARTH  = 6_371;         // km

function calcOrbitalSpeed(altKm) {
  const r = R_EARTH + altKm;
  return Math.sqrt(GM_EARTH / r); // km/s
}

const SatelliteDetails = () => {
  const {
    selectedSatellite,
    setSelectedSatellite,
    satellites,
    isTrackingSelectedSat,
    setIsTrackingSelectedSat,
    setAIQuery,
    viewerRef,
  } = useAppStore();

  if (!selectedSatellite) return null;

  // Sync with real-time updates from satellites list if available
  const currentSat = satellites.find(s => s.satid === selectedSatellite.satid) || selectedSatellite;

  const lat = currentSat.satlat?.toFixed(4) ?? '—';
  const lng = currentSat.satlng?.toFixed(4) ?? '—';
  const altKm = Math.round(currentSat.satalt ?? 0);
  const inclination = currentSat.inclination?.toFixed(2) ?? '—';
  const name = currentSat.satname || `SAT-${currentSat.satid}`;
  
  // Calculate speed based on altitude
  const speedKms = altKm > 0 ? calcOrbitalSpeed(altKm) : 0;
  const speedKmh = speedKms * 3600;



  // Focus camera on satellite
  const handleRecenter = () => {
    if (!viewerRef) return;
    const { Cartesian3 } = window.Cesium || {};
    if (!Cartesian3) return;
    
    const targetAlt = (currentSat.satalt || 500) * 1000 + 1_500_000;
    viewerRef.camera.flyTo({
      destination: Cartesian3.fromDegrees(currentSat.satlng || 0, currentSat.satlat || 0, targetAlt),
      duration: 2.0,
    });
  };

  // Ask AI about this satellite
  const handleAskAI = () => {
    const query = `Tell me about the satellite ${name} (NORAD #${currentSat.satid}). What is its purpose, history, and status?`;
    setAIQuery(query);
  };

  return (
    <div
      id="satellite-details-panel"
      className="panel-enter"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 320,
        zIndex: 50,
        pointerEvents: 'auto',
        background: 'rgba(4, 8, 18, 0.90)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(167, 139, 250, 0.25)',
        borderRadius: 16,
        padding: '16px',
        boxShadow: isTrackingSelectedSat
          ? '0 0 24px rgba(167, 139, 250, 0.25), 0 8px 32px rgba(0, 0, 0, 0.6)'
          : '0 8px 32px rgba(0, 0, 0, 0.6)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(167, 139, 250, 0.12)',
            border: '1px solid rgba(167, 139, 250, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Compass size={16} color="#a78bfa" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#e2e8f0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              margin: 0,
            }}>
              {name}
            </h4>
            <span style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', fontFamily: '"JetBrains Mono", monospace' }}>
              NORAD #{currentSat.satid}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setSelectedSatellite(null)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
          }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Meta info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        padding: '10px 12px',
        marginBottom: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Hash size={11} /> Designator
          </span>
          <span style={{ color: '#94a3b8', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
            {currentSat.intDesignator || '—'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} /> Launch Date
          </span>
          <span style={{ color: '#94a3b8', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
            {currentSat.launchDate || '—'}
          </span>
        </div>
      </div>

      {/* Coordinates / Telemetry */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px 12px',
        marginBottom: 16,
      }}>
        <DetailStat label="LATITUDE" value={`${lat}°`} />
        <DetailStat label="LONGITUDE" value={`${lng}°`} />
        <DetailStat label="ALTITUDE" value={`${altKm} km`} color="#34d399" />
        <DetailStat label="INCLINATION" value={`${inclination}°`} />
        
        {speedKms > 0 && (
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.08em',
              marginBottom: 3,
            }}>
              ORBITAL SPEED
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
            }}>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#34d399',
                fontFamily: '"JetBrains Mono", monospace',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Zap size={11} color="#34d399" />
                {speedKms.toFixed(2)} km/s
              </span>
              <span style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                ~{Math.round(speedKmh).toLocaleString()} km/h
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: 12,
      }}>
        <button
          onClick={() => {
            setIsTrackingSelectedSat(!isTrackingSelectedSat);
            handleRecenter();
          }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            border: `1px solid ${isTrackingSelectedSat ? 'rgba(167, 139, 250, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
            background: isTrackingSelectedSat ? 'rgba(167, 139, 250, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            color: isTrackingSelectedSat ? '#c084fc' : 'rgba(255, 255, 255, 0.7)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.04em',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <Crosshair size={12} className={isTrackingSelectedSat ? 'pulse-glow' : ''} />
          {isTrackingSelectedSat ? 'LOCK CAM' : 'TRACK'}
        </button>

        <button
          onClick={handleAskAI}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            border: '1px solid rgba(52, 211, 153, 0.25)',
            background: 'rgba(52, 211, 153, 0.06)',
            color: '#34d399',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.04em',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.25)';
          }}
        >
          <Bot size={12} />
          ASK AI
        </button>
      </div>
    </div>
  );
};

const DetailStat = ({ label, value, color = '#e2e8f0' }) => (
  <div>
    <div style={{
      fontSize: 9,
      color: 'rgba(255,255,255,0.35)',
      fontFamily: 'Inter',
      letterSpacing: '0.08em',
      marginBottom: 3,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: 12,
      color,
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 700,
    }}>
      {value}
    </div>
  </div>
);

export default SatelliteDetails;
