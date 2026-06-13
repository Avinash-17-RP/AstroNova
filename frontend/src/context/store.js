import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // ── User Location ─────────────────────────────────────────────
  userLocation: null,
  cityName: '',
  setUserLocation: (location) => set({ userLocation: location }),
  setCityName: (name) => set({ cityName: name }),

  // ── Camera Mode: 'earth' | 'space' ───────────────────────────
  cameraMode: 'earth',
  setCameraMode: (mode) => set({ cameraMode: mode }),

  // ── Active Panel (which slide-out is open) ───────────────────
  activePanel: null,  // 'location' | 'satellites' | 'moon' | 'neo' | 'settings' | 'ai'
  setActivePanel: (panel) => set((s) => ({ activePanel: s.activePanel === panel ? null : panel })),

  // ── Satellites ────────────────────────────────────────────────
  satelliteCategory: 'all',  // 'all' | 'iss' | 'starlink' | 'gps' | 'weather' | 'communication'
  setSatelliteCategory: (cat) => set({ satelliteCategory: cat }),
  satellites: [],
  setSatellites: (sats) => set({ satellites: sats }),
  satellitesLastFetch: 0,
  setSatellitesLastFetch: (t) => set({ satellitesLastFetch: t }),

  // ── ISS ───────────────────────────────────────────────────────
  issData: null,
  setISSData: (data) => set({ issData: data }),
  issLastFetch: 0,
  setISSLastFetch: (t) => set({ issLastFetch: t }),
  isTrackingISS: false,
  setIsTrackingISS: (v) => set({ isTrackingISS: v }),

  // ── ISS Passes ────────────────────────────────────────────────
  issPasses: [],
  setISSPasses: (passes) => set({ issPasses: passes }),

  // ── Moon & Bodies ─────────────────────────────────────────────
  moonData: null,
  setMoonData: (data) => set({ moonData: data }),
  bodiesData: null,
  setBodiesData: (data) => set({ bodiesData: data }),
  astronomyLastFetch: 0,
  setAstronomyLastFetch: (t) => set({ astronomyLastFetch: t }),

  // ── NEO (Near-Earth Objects) ──────────────────────────────────
  neoData: [],
  setNeoData: (data) => set({ neoData: data }),
  neoLastFetch: 0,
  setNeoLastFetch: (t) => set({ neoLastFetch: t }),

  // ── NASA APOD ────────────────────────────────────────────────
  apodData: null,
  setAPODData: (data) => set({ apodData: data }),

  // ── Globe Viewer ref (shared for panel click-to-focus) ───────
  viewerRef: null,
  setViewerRef: (ref) => set({ viewerRef: ref }),

  // ── Globe Settings ────────────────────────────────────────────
  showTerrain: true,
  setShowTerrain: (v) => set({ showTerrain: v }),
  showAtmosphere: true,
  setShowAtmosphere: (v) => set({ showAtmosphere: v }),
  showClouds: true,
  setShowClouds: (v) => set({ showClouds: v }),
  showOrbitPaths: true,
  setShowOrbitPaths: (v) => set({ showOrbitPaths: v }),
  satelliteRefreshInterval: 15,  // seconds
  setSatelliteRefreshInterval: (v) => set({ satelliteRefreshInterval: v }),

  // ── Sky View Mode ─────────────────────────────────────────────
  isSkyViewMode: false,
  setSkyViewMode: (mode) => set({ isSkyViewMode: mode }),

  // ── UI ────────────────────────────────────────────────────────
  isAIOpen: false,
  setIsAIOpen: (open) => set({ isAIOpen: open }),

  // ── Errors ───────────────────────────────────────────────────
  error: null,
  setError: (error) => set({ error }),
}));
