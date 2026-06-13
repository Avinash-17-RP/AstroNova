import { useEffect, useCallback } from 'react';
import { useAppStore } from '../context/store';
import AstronomyService from '../services/AstronomyService';
import NASAService from '../services/NASAService';

const ASTRONOMY_INTERVAL_MS = 15 * 60 * 1_000;  // 15 min
const NEO_INTERVAL_MS = 60 * 60 * 1_000;        // 1 hour

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function useAstronomyData() {
  const {
    userLocation,
    moonData, setMoonData,
    bodiesData, setBodiesData,
    astronomyLastFetch, setAstronomyLastFetch,
    neoData, setNeoData,
    neoLastFetch, setNeoLastFetch,
  } = useAppStore();

  // ── Fetch Moon + Celestial Bodies ─────────────────────────────
  const fetchAstronomy = useCallback(async () => {
    if (!userLocation) return;
    const now = Date.now();
    if (now - astronomyLastFetch < ASTRONOMY_INTERVAL_MS && moonData) return;

    const date = todayStr();
    try {
      const [moonResp, bodiesResp] = await Promise.allSettled([
        AstronomyService.getMoonData(userLocation.lat, userLocation.lng, date),
        AstronomyService.getAllBodies(userLocation.lat, userLocation.lng, date),
      ]);

      if (moonResp.status === 'fulfilled' && moonResp.value?.success) {
        setMoonData(moonResp.value.data);
      }
      if (bodiesResp.status === 'fulfilled' && bodiesResp.value?.success) {
        setBodiesData(bodiesResp.value.data);
      }
      setAstronomyLastFetch(now);
    } catch (err) {
      console.warn('Astronomy fetch error:', err.message);
    }
  }, [userLocation, astronomyLastFetch, moonData, setMoonData, setBodiesData, setAstronomyLastFetch]);

  // ── Fetch NEOs ─────────────────────────────────────────────────
  const fetchNEOs = useCallback(async () => {
    const now = Date.now();
    if (now - neoLastFetch < NEO_INTERVAL_MS && neoData.length > 0) return;

    const today = todayStr();
    // NEO feed: 7-day window
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 6);
    const end = endDate.toISOString().split('T')[0];

    try {
      const resp = await NASAService.getNearEarthObjects(today, end);
      if (resp?.success && resp?.data?.near_earth_objects) {
        // Flatten all NEOs across days, sort by closest approach
        const allNEOs = Object.values(resp.data.near_earth_objects)
          .flat()
          .sort((a, b) => {
            const da = parseFloat(a.close_approach_data?.[0]?.miss_distance?.lunar || '999999');
            const db = parseFloat(b.close_approach_data?.[0]?.miss_distance?.lunar || '999999');
            return da - db;
          })
          .slice(0, 20);
        setNeoData(allNEOs);
        setNeoLastFetch(now);
      }
    } catch (err) {
      console.warn('NEO fetch error:', err.message);
    }
  }, [neoLastFetch, neoData.length, setNeoData, setNeoLastFetch]);

  // ── Mount + intervals ──────────────────────────────────────────
  useEffect(() => {
    fetchAstronomy();
    fetchNEOs();

    const astroTimer = setInterval(fetchAstronomy, ASTRONOMY_INTERVAL_MS);
    const neoTimer   = setInterval(fetchNEOs, NEO_INTERVAL_MS);

    return () => {
      clearInterval(astroTimer);
      clearInterval(neoTimer);
    };
  }, [userLocation]);

  return { fetchAstronomy, fetchNEOs };
}
