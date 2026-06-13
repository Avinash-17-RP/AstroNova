import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../context/store';
import SatelliteService from '../services/SatelliteService';

const ISS_INTERVAL_MS = 10_000;   // 10 seconds
const CAT_INTERVAL_MS = 15_000;   // 15 seconds

export function useSatelliteTracking() {
  const {
    userLocation,
    satelliteCategory,
    setSatellites,
    setISSData,
    setISSLastFetch,
    setSatellitesLastFetch,
    issLastFetch,
    satellitesLastFetch,
    setISSPasses,
    setError,
  } = useAppStore();

  const issTimerRef = useRef(null);
  const catTimerRef = useRef(null);

  // ── Fetch ISS position ─────────────────────────────────────────
  const fetchISS = useCallback(async () => {
    if (!userLocation) return;
    const now = Date.now();
    if (now - issLastFetch < ISS_INTERVAL_MS) return;

    try {
      const resp = await SatelliteService.getISSPosition(
        userLocation.lat, userLocation.lng, 0
      );
      if (resp?.success && resp?.data?.positions?.[0]) {
        setISSData(resp.data);
        setISSLastFetch(now);
      }
    } catch (err) {
      console.warn('ISS fetch error:', err.message);
      setError(err.response?.data?.message || err.message);
    }
  }, [userLocation, issLastFetch, setISSData, setISSLastFetch]);

  // ── Fetch ISS next passes ──────────────────────────────────────
  const fetchISSPasses = useCallback(async () => {
    if (!userLocation) return;
    try {
      const resp = await SatelliteService.getISSVisualPasses(
        userLocation.lat, userLocation.lng, 0, 5, 60
      );
      if (resp?.success && resp?.data?.passes) {
        setISSPasses(resp.data.passes);
      }
    } catch (err) {
      console.warn('ISS passes fetch error:', err.message);
      setError(err.response?.data?.message || err.message);
    }
  }, [userLocation, setISSPasses]);

  // ── Fetch category satellites ──────────────────────────────────
  const fetchCategorySatellites = useCallback(async () => {
    if (!userLocation) return;
    const now = Date.now();
    if (now - satellitesLastFetch < CAT_INTERVAL_MS) return;

    try {
      const resp = await SatelliteService.getSatellitesByCategory(
        satelliteCategory, userLocation.lat, userLocation.lng, 30
      );
      // Handle both single (ISS) and above responses
      let sats = [];
      if (resp?.data?.above) {
        sats = resp.data.above;
      } else if (resp?.data?.positions) {
        sats = resp.data.positions;
      }
      setSatellites(sats);
      setSatellitesLastFetch(now);
    } catch (err) {
      console.warn('Satellite category fetch error:', err.message);
      setError(err.response?.data?.message || err.message);
    }
  }, [userLocation, satelliteCategory, satellitesLastFetch, setSatellites, setSatellitesLastFetch]);

  // ── Set up polling intervals ───────────────────────────────────
  useEffect(() => {
    if (!userLocation) return;

    // Immediate fetch
    fetchISS();
    fetchISSPasses();
    fetchCategorySatellites();

    // ISS: every 10s
    issTimerRef.current = setInterval(fetchISS, ISS_INTERVAL_MS);
    // Category: every 15s
    catTimerRef.current = setInterval(fetchCategorySatellites, CAT_INTERVAL_MS);

    return () => {
      clearInterval(issTimerRef.current);
      clearInterval(catTimerRef.current);
    };
  }, [userLocation]); // Only re-run when location changes

  // Re-fetch immediately when category changes
  useEffect(() => {
    useAppStore.setState({ satellitesLastFetch: 0 }); // force refresh
    fetchCategorySatellites();
  }, [satelliteCategory]);

  return { fetchISS, fetchCategorySatellites };
}
