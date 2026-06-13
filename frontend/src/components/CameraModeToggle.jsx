import { Globe, Rocket } from 'lucide-react';
import { useAppStore } from '../context/store';

const CameraModeToggle = () => {
  const { cameraMode, setCameraMode } = useAppStore();

  return (
    <div
      className="mode-pill fixed top-4 right-4 z-50 flex items-center"
      style={{ pointerEvents: 'auto' }}
    >
      <button
        onClick={() => setCameraMode('earth')}
        title="Earth Mode"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: '999px 0 0 999px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          transition: 'all 0.2s ease',
          background: cameraMode === 'earth'
            ? 'linear-gradient(135deg, #00d9ff22, #00d9ff11)'
            : 'transparent',
          color: cameraMode === 'earth' ? '#00d9ff' : 'rgba(255,255,255,0.45)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Globe size={14} strokeWidth={cameraMode === 'earth' ? 2.5 : 1.5} />
        EARTH
      </button>

      <button
        onClick={() => setCameraMode('space')}
        title="Space Mode"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: '0 999px 999px 0',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          transition: 'all 0.2s ease',
          background: cameraMode === 'space'
            ? 'linear-gradient(135deg, #d946ef22, #d946ef11)'
            : 'transparent',
          color: cameraMode === 'space' ? '#d946ef' : 'rgba(255,255,255,0.45)',
        }}
      >
        <Rocket size={14} strokeWidth={cameraMode === 'space' ? 2.5 : 1.5} />
        SPACE
      </button>
    </div>
  );
};

export default CameraModeToggle;
