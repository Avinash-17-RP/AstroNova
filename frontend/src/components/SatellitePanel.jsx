import { useState } from 'react';
import { Radio, Crosshair, ChevronRight } from 'lucide-react';
import { useAppStore } from '../context/store';

const CATEGORIES = [
  { id: 'all',           label: 'All',     color: '#e2e8f0' },
  { id: 'iss',           label: 'ISS',     color: '#ffd700' },
  { id: 'starlink',      label: 'Starlink',color: '#00d9ff' },
  { id: 'gps',           label: 'GPS',     color: '#4ade80' },
  { id: 'weather',       label: 'Weather', color: '#38bdf8' },
  { id: 'communication', label: 'Comm',    color: '#c084fc' },
];

const SatellitePanel = () => {
  const {
    satellites, satelliteCategory, setSatelliteCategory,
    issData, isTrackingISS, setIsTrackingISS, viewerRef,
    setSelectedSatellite,
  } = useAppStore();

  const pos = issData?.positions?.[0];

  const focusSatellite = (lng, lat, alt, sat) => {
    if (sat) {
      setSelectedSatellite(sat);
    }
    if (!viewerRef) return;
    const { Cartesian3 } = window.Cesium || {};
    if (!Cartesian3) return;
    viewerRef.camera.flyTo({
      destination: Cartesian3.fromDegrees(lng, lat, (alt || 500) * 1000 + 1_500_000),
      duration: 2.5,
    });
  };

  return (
    <div className="panel-enter" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(167,139,250,0.12)',
          border: '1px solid rgba(167,139,250,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Radio size={16} color="#a78bfa" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Satellites</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            {satellites.length} tracked • live
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        marginBottom: 16,
      }}>
        {CATEGORIES.map(({ id, label, color }) => {
          const active = satelliteCategory === id;
          return (
            <button
              key={id}
              onClick={() => setSatelliteCategory(id)}
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                border: `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                background: active ? `${color}18` : 'rgba(255,255,255,0.04)',
                color: active ? color : 'rgba(255,255,255,0.45)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s',
                letterSpacing: '0.02em',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ISS Quick Card (always shown) */}
      {pos && (
        <div style={{
          background: 'rgba(255,215,0,0.07)',
          border: '1px solid rgba(255,215,0,0.25)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 14,
          cursor: 'pointer',
        }}
          onClick={() => {
            setIsTrackingISS(!isTrackingISS);
            focusSatellite(pos.satlng, pos.satlat, pos.satalt);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🛸</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ffd700' }}>ISS — ZARYA</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>NORAD #25544</div>
              </div>
            </div>
            <span style={{
              padding: '2px 8px',
              borderRadius: 999,
              background: isTrackingISS ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isTrackingISS ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
              fontSize: 9,
              fontWeight: 700,
              color: isTrackingISS ? '#ffd700' : 'rgba(255,255,255,0.4)',
              letterSpacing: '0.06em',
            }}>
              {isTrackingISS ? '● TRACKING' : 'TRACK'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            <MiniStat label="ALT" value={`${Math.round(pos.satalt ?? 408)} km`} />
            <MiniStat label="LAT" value={`${pos.satlat?.toFixed(1) ?? 0}°`} />
            <MiniStat label="LNG" value={`${pos.satlng?.toFixed(1) ?? 0}°`} />
          </div>
        </div>
      )}

      {/* Satellite list */}
      <div className="panel-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {satellites.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, padding: '20px 0' }}>
            {satelliteCategory === 'iss' ? 'ISS data shown above' : 'Loading satellites…'}
          </div>
        ) : (
          satellites.map((sat, idx) => {
            const catColor = CATEGORIES.find(c => c.id === satelliteCategory)?.color || '#e2e8f0';
            return (
              <SatCard
                key={sat.satid || idx}
                sat={sat}
                color={catColor}
                onFocus={() => focusSatellite(sat.satlng, sat.satlat, sat.satalt, sat)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

const SatCard = ({ sat, color, onFocus }) => (
  <div
    onClick={onFocus}
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      padding: '10px 12px',
      cursor: 'pointer',
      transition: 'all 0.18s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
      e.currentTarget.style.borderColor = `${color}40`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4,
      }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: color, boxShadow: `0 0 4px ${color}`,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 12, fontWeight: 600, color: '#e2e8f0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {sat.satname || `SAT-${sat.satid}`}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <MiniStat label="ALT" value={`${Math.round(sat.satalt ?? 0)} km`} />
        <MiniStat label="INC" value={`${sat.inclination?.toFixed(1) ?? '—'}°`} />
      </div>
    </div>
    <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
  </div>
);

const MiniStat = ({ label, value }) => (
  <div>
    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{label} </span>
    <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{value}</span>
  </div>
);

export default SatellitePanel;
