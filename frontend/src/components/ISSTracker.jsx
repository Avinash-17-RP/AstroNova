import { Crosshair, Navigation, Zap, ArrowUp } from 'lucide-react';
import { useAppStore } from '../context/store';

// ISS orbital speed formula: v = sqrt(GM / r) in km/s
const GM_EARTH = 398_600.4418; // km³/s²
const R_EARTH  = 6_371;         // km

function calcOrbitalSpeed(altKm) {
  const r = R_EARTH + altKm;
  return Math.sqrt(GM_EARTH / r); // km/s
}

const ISSTracker = () => {
  const { issData, isTrackingISS, setIsTrackingISS, issPasses } = useAppStore();

  const pos     = issData?.positions?.[0];
  const satInfo = issData?.info;

  if (!issData || !pos) return null;

  const altKm      = Math.round(pos.satalt ?? 408);
  const lat        = pos.satlat?.toFixed(3) ?? '0.000';
  const lng        = pos.satlng?.toFixed(3) ?? '0.000';
  const speedKms   = calcOrbitalSpeed(altKm).toFixed(2);   // km/s
  const inclDeg    = satInfo?.inclination?.toFixed(1)       // from N2YO info
                     ?? '51.6';                             // ISS standard inclination

  const nextPass = issPasses?.[0];
  let nextPassStr = 'No upcoming pass';
  let nextPassDuration = '';
  if (nextPass?.startUTC) {
    const d = new Date(nextPass.startUTC * 1000);
    nextPassStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (nextPass.duration) {
      nextPassDuration = `${Math.round(nextPass.duration / 60)} min`;
    }
  }

  return (
    <div
      id="iss-hud"
      className="iss-hud"
      style={{
        position: 'fixed',
        bottom: 20,
        left: 66,      // right of toolbar
        zIndex: 50,
        pointerEvents: 'auto',
        minWidth: 238,
        background: 'rgba(4, 8, 18, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isTrackingISS ? 'rgba(255,215,0,0.35)' : 'rgba(255,215,0,0.15)'}`,
        borderRadius: 14,
        padding: '11px 14px 12px',
        boxShadow: isTrackingISS
          ? '0 0 20px rgba(255,215,0,0.2), 0 4px 24px rgba(0,0,0,0.5)'
          : '0 4px 24px rgba(0,0,0,0.5)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            className="ping-dot"
            style={{
              display: 'inline-block', width: 7, height: 7,
              borderRadius: '50%', background: '#ffd700',
              boxShadow: '0 0 8px #ffd700',
            }}
          />
          <span style={{
            fontSize: 11, fontWeight: 800,
            letterSpacing: '0.1em', color: '#ffd700',
            fontFamily: 'Inter, sans-serif',
          }}>
            ISS LIVE
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
            ZARYA
          </span>
        </div>

        <button
          onClick={() => setIsTrackingISS(!isTrackingISS)}
          title={isTrackingISS ? 'Stop tracking' : 'Lock camera to ISS'}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            border: `1px solid ${isTrackingISS ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: isTrackingISS ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
            color: isTrackingISS ? '#ffd700' : 'rgba(255,255,255,0.5)',
            fontSize: 10, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em',
          }}
        >
          <Crosshair size={10} />
          {isTrackingISS ? '● LOCK' : 'TRACK'}
        </button>
      </div>

      {/* ── Stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 10px', marginBottom: 9 }}>
        <Stat label="LAT"  value={`${lat}°`} />
        <Stat label="LNG"  value={`${lng}°`} />
        <Stat label="ALT"  value={`${altKm} km`} color="#34d399" />
        <Stat label="SPD"  value={`${speedKms} km/s`} color="#34d399" icon={<Zap size={8} color="#34d399" />} />
        <Stat label="INC"  value={`${inclDeg}°`} />
        <Stat label="NORAD" value="25544" />
      </div>

      {/* ── Next pass ── */}
      <div style={{
        paddingTop: 8,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Navigation size={10} color="rgba(255,255,255,0.35)" />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>
          Next pass:
        </span>
        <span style={{
          fontSize: 10, color: '#00d9ff',
          fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
        }}>
          {nextPassStr}
        </span>
        {nextPassDuration && (
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>
            ({nextPassDuration})
          </span>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, color = '#e2e8f0', icon }) => (
  <div>
    <div style={{
      fontSize: 9, color: 'rgba(255,255,255,0.3)',
      fontFamily: 'Inter', letterSpacing: '0.08em', marginBottom: 2,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: 11, color,
      fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
      display: 'flex', alignItems: 'center', gap: 3,
    }}>
      {icon}{value}
    </div>
  </div>
);

export default ISSTracker;
