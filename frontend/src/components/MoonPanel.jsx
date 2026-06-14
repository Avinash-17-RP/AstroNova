import { Moon, Star, Sunrise, Sunset, Eye } from 'lucide-react';
import { useAppStore } from '../context/store';

// ── Moon phase helpers ────────────────────────────────────────────
const PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

function getPhaseName(fraction) {
  // fraction 0–1
  const idx = Math.round(fraction * 8) % 8;
  return PHASES[idx];
}

function MoonPhaseSVG({ illumination = 0, phase = 'Full Moon' }) {
  // Simple SVG moon phase visualizer
  const r = 36;
  const isWaxing = phase.toLowerCase().includes('waxing') || phase === 'New Moon';
  const isNew = illumination < 0.02;
  const isFull = illumination > 0.98;

  return (
    <svg
      width={80}
      height={80}
      viewBox="0 0 80 80"
      style={{ filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.4))' }}
    >
      {/* dark sphere */}
      <circle
        cx={40}
        cy={40}
        r={r}
        fill="#1a1a2e"
        stroke="rgba(251,191,36,0.2)"
        strokeWidth={1}
      />
      {/* illuminated portion */}
      {isFull ? (
        <circle cx={40} cy={40} r={r} fill="#fbbf24" opacity={0.9} />
      ) : isNew ? null : (
        <ellipse
          cx={40}
          cy={40}
          rx={r * illumination * 1.8}
          ry={r}
          fill="#fbbf24"
          opacity={0.85}
          transform={isWaxing ? undefined : `scale(-1,1) translate(-80,0)`}
        />
      )}
      {/* terminator ring */}
      <circle
        cx={40}
        cy={40}
        r={r}
        fill="none"
        stroke="rgba(251,191,36,0.35)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

const PLANET_EMOJIS = {
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '⛢',
  neptune: '♆',
  sun: '☀',
};

const MoonPanel = () => {
  const { moonData, bodiesData } = useAppStore();

  // ── Moon data parsing ─────────────────────────────────────────
  const moon = moonData;
  const moonBody = moon?.data?.table?.rows?.find(
    (r) => r.entry?.name?.toLowerCase() === 'moon'
  );
  const moonCells = moonBody?.cells?.[0];

  const rawIllumination = parseFloat(
    moonCells?.extraInfo?.illumination?.value ??
      moon?.illumination ??
      moon?.illuminationFraction ??
      0
  );

  // Astronomy APIs sometimes return illumination as:
  // - 0..1 (fraction)
  // - 0..100 (percent)
  const illuminationFraction = rawIllumination > 1.5 ? rawIllumination / 100 : rawIllumination;
  const illumination = Math.max(0, Math.min(1, illuminationFraction));

  const phase =
    moonCells?.extraInfo?.phase?.string || moon?.phase || getPhaseName(illumination);

  const distance = Math.round(
    parseFloat(moonCells?.distance?.fromEarth?.km ?? moon?.distance ?? 384400)
  ).toLocaleString();

  const riseStr = moonCells?.extraInfo?.riseTime ?? moon?.moonrise ?? '—';
  const setStr = moonCells?.extraInfo?.setTime ?? moon?.moonset ?? '—';

  const altitudeDeg = parseFloat(
    moonCells?.position?.horizontal?.altitude?.degrees ?? moon?.altitude ?? 0
  ).toFixed(1);

  const azimuthDeg = parseFloat(
    moonCells?.position?.horizontal?.azimuth?.degrees ?? moon?.azimuth ?? 0
  ).toFixed(1);

  // ── Bodies / planets ──────────────────────────────────────────
  const planetRows =
    bodiesData?.data?.table?.rows?.filter((r) => {
      const name = r.entry?.name?.toLowerCase();
      return ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(name);
    }) ?? [];

  const planets = planetRows.map((r) => {
    const cell = r.cells?.[0];
    return {
      name: r.entry?.name ?? '—',
      altitude: parseFloat(cell?.position?.horizontal?.altitude?.degrees ?? 0).toFixed(1),
      azimuth: parseFloat(cell?.position?.horizontal?.azimuth?.degrees ?? 0).toFixed(1),
      magnitude: cell?.extraInfo?.magnitude?.value ?? '—',
      rise: cell?.extraInfo?.riseTime ?? '—',
      set: cell?.extraInfo?.setTime ?? '—',
      visible: parseFloat(cell?.position?.horizontal?.altitude?.degrees ?? -999) > 0,
    };
  });

  return (
    <div className="panel-enter" style={{ padding: '0 20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingTop: 16 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'rgba(251,191,36,0.12)',
            border: '1px solid rgba(251,191,36,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Moon size={16} color="#fbbf24" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Moon & Planets</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Live ephemeris data</div>
        </div>
      </div>

      {/* Moon phase card */}
      <div
        style={{
          background: 'rgba(251,191,36,0.06)',
          border: '1px solid rgba(251,191,36,0.18)',
          borderRadius: 14,
          padding: '16px',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <MoonPhaseSVG illumination={illumination} phase={phase} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>{phase}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
              {(illumination * 100).toFixed(0)}% illuminated
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <MoonStat label="ALT" value={`${altitudeDeg}°`} />
              <MoonStat label="AZ" value={`${azimuthDeg}°`} />
            </div>
          </div>
        </div>

        {/* Rise / Set */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sunrise size={12} color="#fbbf24" />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Rise</span>
            <span style={{ fontSize: 11, color: '#fbbf24', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
              {riseStr}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sunset size={12} color="#fb923c" />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Set</span>
            <span style={{ fontSize: 11, color: '#fb923c', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
              {setStr}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, gridColumn: '1 / -1' }}>
            <Moon size={12} color="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Distance</span>
            <span style={{ fontSize: 11, color: '#e2e8f0', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
              {distance} km
            </span>
          </div>
        </div>
      </div>

      {/* Planets section */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <Star size={12} color="#94a3b8" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em' }}>VISIBLE PLANETS</span>
        </div>

        {planets.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, padding: '16px 0' }}>
            Loading planet data…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {planets.map((p) => (
              <PlanetCard key={p.name} planet={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MoonStat = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 2 }}>
      {label}
    </div>
    <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{value}</div>
  </div>
);

const PlanetCard = ({ planet }) => {
  const emoji = PLANET_EMOJIS[planet.name.toLowerCase()] ?? '⭐';
  return (
    <div
      style={{
        background: planet.visible ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${planet.visible ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
        borderRadius: 10,
        padding: '9px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: planet.visible ? 1 : 0.55,
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{planet.name}</span>
          {planet.visible && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#34d399',
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 999,
                padding: '1px 5px',
                letterSpacing: '0.04em',
              }}
            >
              VISIBLE
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <PlanetStat label="ALT" value={`${planet.altitude}°`} />
          <PlanetStat label="AZ" value={`${planet.azimuth}°`} />
          {planet.magnitude !== '—' && <PlanetStat label="MAG" value={planet.magnitude} />}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {planet.rise !== '—' && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>↑ {planet.rise}</div>
        )}
        {planet.set !== '—' && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>↓ {planet.set}</div>}
      </div>
    </div>
  );
};

const PlanetStat = ({ label, value }) => (
  <div>
    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{label} </span>
    <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{value}</span>
  </div>
);

export default MoonPanel;

