import { useEffect, useState } from 'react';
import Globe             from './components/Globe';
import FloatingToolbar   from './components/FloatingToolbar';
import CameraModeToggle  from './components/CameraModeToggle';
import ISSTracker        from './components/ISSTracker';
import SlidePanel        from './components/SlidePanel';
import SkyViewPanel      from './components/SkyViewPanel';
import PlanetInfoPopup    from './components/PlanetInfoPopup';
import AIAssistant       from './components/AIAssistant';
import SatelliteDetails  from './components/SatelliteDetails';
import { useAppStore }   from './context/store';

import { useSatelliteTracking } from './hooks/useSatelliteTracking';
import { useAstronomyData }     from './hooks/useAstronomyData';

// ── Loading splash ────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    position: 'fixed', inset: 0,
    background: '#050914',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  }}>
    {/* Animated rings */}
    <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 28 }}>
      <div style={{
        position: 'absolute', inset: 0,
        border: '2px solid transparent',
        borderTopColor: '#00d9ff',
        borderRadius: '50%',
        animation: 'orbit-spin 1.0s linear infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 10,
        border: '2px solid transparent',
        borderTopColor: '#a78bfa',
        borderRadius: '50%',
        animation: 'orbit-spin 0.75s linear infinite reverse',
      }} />
      <div style={{
        position: 'absolute', inset: 22,
        border: '2px solid transparent',
        borderTopColor: '#fbbf24',
        borderRadius: '50%',
        animation: 'orbit-spin 0.5s linear infinite',
      }} />
      {/* Center dot */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 14, height: 14,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #00d9ff, #00a3bf)',
        boxShadow: '0 0 20px #00d9ff',
      }} />
    </div>

    <div style={{
      fontSize: 24, fontWeight: 800,
      background: 'linear-gradient(135deg, #00d9ff, #a78bfa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.02em',
      marginBottom: 8,
    }}>
      AstroNova
    </div>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
      Initialising space situational awareness…
    </div>
  </div>
);

// ── Data hooks wrapper (must be inside store context) ─────────────
function DataProvider() {
  useSatelliteTracking();
  useAstronomyData();
  return null;
}

// ── Main App ──────────────────────────────────────────────────────
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { setUserLocation, setCityName, setError, selectedSatellite, setSelectedSatellite, selectedPlanet } = useAppStore();


  // Auto-detect location on mount
  useEffect(() => {
    const detect = () => {
      if (!navigator.geolocation) {
        setUserLocation({ lat: 0, lng: 0 });
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude: lat, longitude: lng } = coords;
          setUserLocation({ lat, lng });

          // Reverse geocode silently
          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await resp.json();
            const city = data.address?.city
              || data.address?.town
              || data.address?.village
              || data.address?.county
              || 'Unknown';
            setCityName(city);
          } catch (_) {
            setCityName('Unknown');
          }

          setIsLoading(false);
        },
        (err) => {
          console.warn('Geolocation denied or timed out:', err.message);
          setUserLocation({ lat: 28.6, lng: 77.2 }); // fallback: New Delhi
          setCityName('New Delhi');
          setIsLoading(false);
        },
        { timeout: 15000, maximumAge: 300_000 }
      );
    };

    // Small delay so Cesium can start loading its assets in parallel
    const t = setTimeout(detect, 300);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div
      id="astronova-root"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#050914' }}
    >
      {/* ── 1. Globe fills entire viewport ── */}
      <Globe />

      {/* ── 2. Data fetching (no render) ── */}
      <DataProvider />

      {/* ── 3. Left: Floating icon toolbar ── */}
      <FloatingToolbar />

      {/* ── 4. Left: Slide-out panels ── */}
      <SlidePanel />

      {/* ── 4b. Right: Sky View panel (when in sky mode) ── */}
      <SkyViewPanel />

      {/* ── 5. Top-right: Earth/Space toggle ── */}
      <CameraModeToggle />

      {/* ── 6. Bottom-left: ISS live HUD ── */}
      <ISSTracker />

      {/* ── 7. AI Assistant (triggered from toolbar) ── */}
      <AIAssistant />

      {/* ── 8a. Selected satellite details HUD ── */}
      <SatelliteDetails />

      {/* ── 8b. Planet Info Popup (on click) ── */}
      {selectedPlanet && (
        <PlanetInfoPopup
          planet={selectedPlanet}
          onClose={() => {
            /* store handles clearing */
          }}
        />
      )}
    </div>
  );
}


export default App;
