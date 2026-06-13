import { MapPin, Radio, Moon, Zap, Bot, Settings } from 'lucide-react';
import { useAppStore } from '../context/store';

const TOOLS = [
  { id: 'location',   icon: MapPin,    label: 'My Location',    color: '#00d9ff' },
  { id: 'satellites', icon: Radio,     label: 'Satellites',     color: '#a78bfa' },
  { id: 'moon',       icon: Moon,      label: 'Moon & Planets', color: '#fbbf24' },
  { id: 'neo',        icon: Zap,       label: 'Near-Earth Objects', color: '#f87171' },
  { id: 'ai',         icon: Bot,       label: 'AI Assistant',   color: '#34d399' },
  { id: 'settings',   icon: Settings,  label: 'Settings',       color: '#94a3b8' },
];

const FloatingToolbar = () => {
  const { activePanel, setActivePanel, setIsAIOpen } = useAppStore();

  const handleClick = (id) => {
    if (id === 'ai') {
      setIsAIOpen(true);
      setActivePanel(null);
    } else {
      setActivePanel(id);
    }
  };

  return (
    <div
      className="fixed left-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2"
      style={{ pointerEvents: 'auto' }}
    >
      {TOOLS.map(({ id, icon: Icon, label, color }) => {
        const isActive = activePanel === id;
        return (
          <button
            key={id}
            onClick={() => handleClick(id)}
            data-tooltip={label}
            aria-label={label}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: isActive
                ? `linear-gradient(135deg, ${color}22, ${color}15)`
                : 'rgba(5,9,20,0.75)',
              border: `1.5px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: isActive ? `0 0 12px ${color}55` : '0 2px 8px rgba(0,0,0,0.4)',
              transform: isActive ? 'scale(1.08)' : 'scale(1)',
              position: 'relative',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = `${color}15`;
                e.currentTarget.style.borderColor = `${color}80`;
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(5,9,20,0.75)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }
            }}
          >
            <Icon
              size={18}
              color={isActive ? color : 'rgba(255,255,255,0.7)'}
              strokeWidth={isActive ? 2.5 : 2}
            />
            {/* Active dot */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: color,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FloatingToolbar;
