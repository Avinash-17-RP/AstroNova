import axios from 'axios';
import * as satellite from 'satellite.js';

// Simple TLE-based fallback service using Celestrak active TLEs
class TLEService {
  constructor() {
    this.tleUrl = 'https://celestrak.com/NORAD/elements/active.txt';
    this.cache = { tles: [], ts: 0 };
    this.cacheTTL = 1000 * 60 * 60; // 1 hour
    // Minimal demo TLEs used when external fetch fails
    this.demoTLEs = [
      {
        name: 'ISS (ZARYA)',
        line1: '1 25544U 98067A   26016.66351997  .00006452  00000-0  12139-3 0  9992',
        line2: '2 25544  51.6432 203.1572 0008289  52.8238 307.3502 15.50414104298182',
      },
      {
        name: 'HUBBLE',
        line1: '1 20580U 90037B   26016.15567807  .00000606  00000-0  37579-4 0  9994',
        line2: '2 20580  28.4692 243.1234 0003037  86.1234 274.8766 15.09212345678901',
      },
      {
        name: 'STARLINK-DEMO',
        line1: '1 44238U 19029A   26016.12345678  .00001234  00000-0  12345-3 0  9991',
        line2: '2 44238  53.0000 100.0000 0001500 200.0000 160.0000 15.05500000123456',
      },
    ];
  }

  // Fetch and parse TLEs from Celestrak (cached)
  async _loadTLEs() {
    const now = Date.now();
    if (this.cache.tles.length > 0 && (now - this.cache.ts) < this.cacheTTL) {
      return this.cache.tles;
    }

    let text = '';
    try {
      const resp = await axios.get(this.tleUrl, { responseType: 'text', timeout: 15000 });
      text = resp.data || '';
    } catch (err) {
      // Some environments have TLS issues; try HTTP fallback
      try {
        const alt = this.tleUrl.replace('https://', 'http://');
        const resp2 = await axios.get(alt, { responseType: 'text', timeout: 15000 });
        text = resp2.data || '';
      } catch (err2) {
        // If fetching fails, use demo TLEs as a last resort so the UI shows satellites
        console.error('TLEService: failed to load TLEs from Celestrak', err2?.message || err.message);
        this.cache = { tles: this.demoTLEs, ts: Date.now() };
        return this.cache.tles;
      }
    }
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const tles = [];
    for (let i = 0; i < lines.length; i += 3) {
      const name = lines[i] || 'UNKNOWN';
      const line1 = lines[i + 1] || '';
      const line2 = lines[i + 2] || '';
      if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
        tles.push({ name, line1, line2 });
      }
    }

    this.cache = { tles, ts: Date.now() };
    return tles;
  }

  // Compute which satellites are above the given lat/lng (approx) using satellite.js
  async getSatellitesAbove(lat, lng, alt = 0, radius = 90, category = 0, limit = 25) {
    const tles = await this._loadTLEs();
    const now = new Date();
    const observerLatRad = satellite.degreesToRadians(lat);
    const observerLngRad = satellite.degreesToRadians(lng);

    const results = [];

    for (let i = 0; i < tles.length && results.length < limit * 4; i++) {
      try {
        const { name, line1, line2 } = tles[i];
        const satrec = satellite.twoline2satrec(line1, line2);
        const pv = satellite.propagate(satrec, now);
        const positionEci = pv.position;
        if (!positionEci) continue;

        const gmst = satellite.gstime(now);
        const positionEcf = satellite.eciToEcf(positionEci, gmst);

        const observerGd = {
          longitude: observerLngRad,
          latitude: observerLatRad,
          height: alt || 0,
        };

        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
        const elevationDeg = satellite.radiansToDegrees(lookAngles.elevation || 0);

        if (elevationDeg > 0) {
          // Compute geodetic position of sat subpoint for lat/lng/height values
          const geodetic = satellite.eciToGeodetic(positionEci, gmst);
          const satLat = satellite.radiansToDegrees(geodetic.latitude || 0);
          const satLng = satellite.radiansToDegrees(geodetic.longitude || 0);
          const satAlt = geodetic.height || 0;

          results.push({
            satname: name,
            satlat: satLat,
            satlng: satLng,
            satalt: Math.round(satAlt),
            elevation: +elevationDeg.toFixed(2),
            inclination: satrec.inclo ? +((satrec.inclo * 180) / Math.PI).toFixed(2) : undefined,
          });
        }
      } catch (err) {
        // ignore individual parsing/propagation errors
        continue;
      }
    }

    // Sort by elevation desc (most overhead first) and limit
    results.sort((a, b) => (b.elevation || 0) - (a.elevation || 0));
    // If we used demo TLEs and propagation returned nothing, synthesize a small demo list
    if ((this.cache.tles === this.demoTLEs || (tles && tles.length > 0 && tles === this.demoTLEs)) && results.length === 0) {
      const demo = this.demoTLEs.slice(0, limit).map((d, i) => ({
        satname: d.name,
        satlat: lat + (i * 0.5),
        satlng: lng + (i * 0.5),
        satalt: i === 0 ? 420 : 550,
        elevation: 45 - i * 5,
        inclination: i === 0 ? 51.6 : 53.0,
      }));
      return { above: demo };
    }

    return { above: results.slice(0, limit) };
  }
}

export default new TLEService();
