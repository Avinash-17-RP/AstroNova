import { X } from 'lucide-react';
import { useAppStore } from '../context/store';

const PlanetInfoPopup = ({ planet, onClose }) => {
  const { setSelectedPlanet } = useAppStore();

  if (!planet) return null;

  const close = () => {
    setSelectedPlanet(null);
    onClose?.();
  };


  return (
    <div
      className="fixed inset-0 z-[1000]"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={close}
    >
      <div
        className="glass"
        style={{
          width: 360,
          maxWidth: '92vw',
          margin: '10vh auto 0',
          padding: 16,
          borderRadius: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.02em' }}>
              {planet.emoji ?? '🪐'} {planet.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
              {planet.visible ? 'Visible' : 'Not currently above horizon'}
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              width: 34,
              height: 34,
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          <InfoItem label="Altitude" value={planet.altitude != null ? `${planet.altitude}°` : '—'} />
          <InfoItem label="Azimuth" value={planet.azimuth != null ? `${planet.azimuth}°` : '—'} />

          <InfoItem label="Distance" value={planet.distance ? `${planet.distance}` : '—'} />
          <InfoItem label="Magnitude" value={planet.magnitude && planet.magnitude !== '—' ? `${planet.magnitude}` : '—'} />

          <InfoItem label="Moons" value={planet.moons != null ? `${planet.moons}` : '—'} />
          <InfoItem label="Ring System" value={planet.rings ? 'Yes' : 'No'} />
        </div>

        {planet.activity ? (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginBottom: 6 }}>
              Interesting facts
            </div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>{planet.activity}</div>
          </div>
        ) : null}

        <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          Tip: Click another planet to compare.
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 4 }}>
      {label.toUpperCase()}
    </div>
    <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>{value}</div>
  </div>
);

export default PlanetInfoPopup;

