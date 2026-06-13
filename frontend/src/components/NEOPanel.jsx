import { Zap, AlertTriangle, ChevronRight, Calendar, Gauge, Target } from 'lucide-react';
import { useAppStore } from '../context/store';

const KM_PER_LD = 384_400; // 1 lunar distance ≈ 384,400 km

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

const NEOPanel = () => {
  const { neoData } = useAppStore();

  const sorted = [...neoData].sort((a, b) => {
    const da = parseFloat(a.close_approach_data?.[0]?.miss_distance?.lunar ?? 9999);
    const db = parseFloat(b.close_approach_data?.[0]?.miss_distance?.lunar ?? 9999);
    return da - db;
  });

  const hazardous  = sorted.filter(n => n.is_potentially_hazardous_asteroid);
  const safeCount  = sorted.length - hazardous.length;

  return (
    <div className="panel-enter" style={{ padding: '0 20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingTop: 16 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(248,113,113,0.12)',
          border: '1px solid rgba(248,113,113,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={16} color="#f87171" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Near-Earth Objects</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Next 7 days • NASA NeoWs</div>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 8, marginBottom: 14,
      }}>
        <SumCard value={sorted.length} label="Total NEOs" color="#94a3b8" />
        <SumCard value={hazardous.length} label="Hazardous" color="#f87171" blink={hazardous.length > 0} />
      </div>

      {/* NEO list */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, padding: '24px 0' }}>
          Loading NEO data…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map((neo, idx) => (
            <NEOCard key={neo.id ?? idx} neo={neo} />
          ))}
        </div>
      )}
    </div>
  );
};

const SumCard = ({ value, label, color, blink }) => (
  <div style={{
    background: `${color}0a`,
    border: `1px solid ${color}22`,
    borderRadius: 10,
    padding: '10px 12px',
    textAlign: 'center',
  }}>
    <div style={{
      fontSize: 22, fontWeight: 800,
      color, fontFamily: '"JetBrains Mono", monospace',
      animation: blink ? 'pulse-red 2s ease-in-out infinite' : 'none',
    }}>{value}</div>
    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{label}</div>
  </div>
);

const NEOCard = ({ neo }) => {
  const approach   = neo.close_approach_data?.[0];
  const isHazard   = neo.is_potentially_hazardous_asteroid;
  const date       = formatDate(approach?.close_approach_date);
  const lunarDist  = parseFloat(approach?.miss_distance?.lunar ?? 0).toFixed(2);
  const kmDist     = parseInt(approach?.miss_distance?.kilometers ?? 0).toLocaleString();
  const velocity   = parseFloat(approach?.relative_velocity?.kilometers_per_hour ?? 0).toFixed(0);
  const diamMin    = parseFloat(neo.estimated_diameter?.kilometers?.estimated_diameter_min ?? 0).toFixed(3);
  const diamMax    = parseFloat(neo.estimated_diameter?.kilometers?.estimated_diameter_max ?? 0).toFixed(3);

  const accentColor = isHazard ? '#f87171' : '#94a3b8';

  return (
    <div style={{
      background: isHazard ? 'rgba(248,113,113,0.05)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isHazard ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 10,
      padding: '11px 13px',
      transition: 'all 0.18s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = isHazard ? 'rgba(248,113,113,0.09)' : 'rgba(255,255,255,0.055)';
        e.currentTarget.style.borderColor = isHazard ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isHazard ? 'rgba(248,113,113,0.05)' : 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = isHazard ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.07)';
      }}
    >
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: accentColor,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {neo.name?.replace(/[()]/g, '') ?? 'Unknown'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
            ID: {neo.id ?? '—'}
          </div>
        </div>
        {isHazard && (
          <span className="hazard-badge" style={{ marginLeft: 8, flexShrink: 0 }}>
            ⚠ PHO
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 10px' }}>
        <NEOStat icon={<Calendar size={9} />} label="Approach" value={date} color={accentColor} />
        <NEOStat icon={<Gauge size={9} />} label="Velocity" value={`${parseInt(velocity).toLocaleString()} km/h`} color={accentColor} />
        <NEOStat icon={<Target size={9} />} label="Miss dist" value={`${lunarDist} LD`} color={accentColor} />
        <NEOStat icon={<ChevronRight size={9} />} label="Diameter" value={`${diamMin}–${diamMax} km`} color={accentColor} />
      </div>
    </div>
  );
};

const NEOStat = ({ icon, label, value, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.3)' }}>
      {icon}
      <span style={{ fontSize: 9, letterSpacing: '0.06em' }}>{label}</span>
    </div>
    <div style={{ fontSize: 11, color, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
      {value}
    </div>
  </div>
);

export default NEOPanel;
