import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../context/store';
import LocationPanel  from './LocationPanel';
import SatellitePanel from './SatellitePanel';
import MoonPanel      from './MoonPanel';
import NEOPanel       from './NEOPanel';
import SettingsPanel  from './SettingsPanel';

const PANEL_MAP = {
  location:   { Component: LocationPanel,  title: 'My Location',        color: '#00d9ff' },
  satellites: { Component: SatellitePanel, title: 'Satellites',         color: '#a78bfa' },
  moon:       { Component: MoonPanel,      title: 'Moon & Planets',     color: '#fbbf24' },
  neo:        { Component: NEOPanel,       title: 'Near-Earth Objects', color: '#f87171' },
  settings:   { Component: SettingsPanel,  title: 'Settings',           color: '#94a3b8' },
};

const SlidePanel = () => {
  const { activePanel, setActivePanel } = useAppStore();
  const [visiblePanel, setVisiblePanel] = useState(null);
  const [animState, setAnimState] = useState('hidden'); // 'hidden' | 'entering' | 'visible' | 'exiting'
  const exitTimer = useRef(null);

  useEffect(() => {
    if (exitTimer.current) clearTimeout(exitTimer.current);

    if (activePanel) {
      setVisiblePanel(activePanel);
      setAnimState('entering');
      // Promote to visible after a frame so the CSS transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimState('visible'));
      });
    } else {
      setAnimState('exiting');
      exitTimer.current = setTimeout(() => {
        setVisiblePanel(null);
        setAnimState('hidden');
      }, 220);
    }

    return () => clearTimeout(exitTimer.current);
  }, [activePanel]);

  if (!visiblePanel) return null;

  const entry = PANEL_MAP[visiblePanel];
  if (!entry) return null;

  const { Component, color } = entry;

  return (
    <div
      id="slide-panel"
      style={{
        position: 'fixed',
        top: 0,
        left: 58,           // right of the 44px toolbar + gap
        width: 300,
        height: '100vh',
        zIndex: 45,
        pointerEvents: 'auto',
        transform: animState === 'visible' ? 'translateX(0)' : 'translateX(-16px)',
        opacity: animState === 'visible' ? 1 : 0,
        transition: 'transform 0.24s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Panel card */}
      <div
        style={{
          margin: '12px 0 12px 6px',
          flex: 1,
          background: 'rgba(4, 8, 18, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${color}22`,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${color}11`,
        }}
      >
        {/* Close strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '10px 14px 0',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setActivePanel(null)}
            aria-label="Close panel"
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              color: 'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="panel-scroll"
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        >
          <Component />
        </div>
      </div>
    </div>
  );
};

export default SlidePanel;
