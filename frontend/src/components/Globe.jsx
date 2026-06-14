import { useEffect, useMemo, useRef } from 'react';
import {
  Viewer,
  Cartesian3,
  Color,
  Math as CesiumMath,
  createWorldTerrainAsync,
  ScreenSpaceEventType,
  HeightReference,
  VerticalOrigin,
  HorizontalOrigin,
  LabelStyle,
  NearFarScalar,
  Cartesian2,
  PolylineDashMaterialProperty,
  PolylineCollection,
  PolylineOutlineMaterialProperty,
  Ellipsoid,
} from 'cesium';

import { useAppStore } from '../context/store';

// ── Category colors ──────────────────────────────────────────────
const CAT_COLORS = {
  iss:           Color.GOLD,
  starlink:      Color.CYAN,
  gps:           Color.LIME,
  weather:       Color.SKYBLUE,
  communication: Color.VIOLET,
  all:           Color.WHITE,
};

const ISS_NORAD = 25544;

const Globe = () => {
  const containerRef  = useRef(null);
  const viewerRef     = useRef(null);
  const entitiesRef   = useRef({ userMarker: null, iss: null, satellites: [], orbits: [], planets: [] });
  const orbitLinesRef = useRef(null); // PolylineCollection for orbit paths


  const {
    userLocation,
    cameraMode,
    satellites,
    issData,
    satelliteCategory,
    showTerrain,
    showAtmosphere,
    isTrackingISS,
    setViewerRef,
    showOrbitPaths,
    isSkyViewMode,
    selectedSatellite,
    setSelectedSatellite,
    bodiesData,
    setSelectedPlanet,
    isTrackingSelectedSat,
  } = useAppStore();



  // ── Init Cesium Viewer ────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const initViewer = async () => {
      try {
        // Try to load World Terrain; fall back gracefully
        let terrainProvider;
        try {
          terrainProvider = await createWorldTerrainAsync({ requestWaterMask: true });
        } catch (_) {
          terrainProvider = undefined;
        }

        const viewer = new Viewer(containerRef.current, {
          terrainProvider,
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          orderIndependentTranslucency: false,
          requestRenderMode: false,
          // Use Bing for good satellite imagery
        });

        const scene = viewer.scene;
        const globe  = scene.globe;

        // Atmosphere & lighting
        globe.showGroundAtmosphere = true;
        globe.enableLighting = true;
        globe.dynamicAtmosphereLighting = true;
        globe.dynamicAtmosphereLightingFromSun = true;
        scene.skyBox.show = true;
        scene.sun.show = true;
        scene.moon.show = true;
        scene.fog.enabled = true;
        scene.fog.density = 0.0001;
        scene.postProcessStages.ambientOcclusion.enabled = false;

        // Enable atmosphere glow
        scene.skyAtmosphere.show = true;
        scene.skyAtmosphere.hueShift = 0.0;
        scene.skyAtmosphere.saturationShift = 0.1;
        scene.skyAtmosphere.brightnessShift = 0.0;

        // Enable shadows
        viewer.shadows = true;
        viewer.terrainShadows = 1; // RECEIVE_ONLY

        // Camera controls
        scene.screenSpaceCameraController.enableRotate    = true;
        scene.screenSpaceCameraController.enableTranslate = true;
        scene.screenSpaceCameraController.enableZoom      = true;
        scene.screenSpaceCameraController.enableTilt      = true;
        scene.screenSpaceCameraController.enableLook      = true;
        scene.screenSpaceCameraController.minimumZoomDistance = 150_000;
        scene.screenSpaceCameraController.maximumZoomDistance = 120_000_000;

        // Disable Cesium credit
        viewer._cesiumWidget._creditContainer.style.display = 'none';

        // Initial camera — straight down view of round Earth
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(0, 0, 24_000_000),
          orientation: { heading: 0, pitch: CesiumMath.toRadians(-90), roll: 0 },
          duration: 0,
        });



        // ── Double-click → focus entity ─────────────────────
        viewer.screenSpaceEventHandler.setInputAction((click) => {
          const picked = viewer.scene.pick(click.position);
          if (picked?.id && picked.id.position?.getValue) {
            const pos = picked.id.position.getValue(viewer.clock.currentTime);
            if (pos) {
              viewer.camera.flyTo({
                destination: pos,
                duration: 2.0,
              });
            }
          }
        }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // ── Left-click → show satellite/planet popup ───────────
        viewer.screenSpaceEventHandler.setInputAction((click) => {
          const picked = viewer.scene.pick(click.position);
          const data = picked?.id?.satelliteData;
          const planet = picked?.id?.planetData;

          if (planet) {
            setSelectedPlanet(planet);
            return;
          }

          if (data) {
            setSelectedSatellite(data);
            console.log('Selected satellite:', data.satname);
          }
        }, ScreenSpaceEventType.LEFT_CLICK);


        viewerRef.current = viewer;
        setViewerRef(viewer);

        // ── Scroll isolation ────────────────────────────────────
        const canvas = viewer.canvas;
        canvas.addEventListener('mouseenter', () => {
          document.body.style.overflow = 'hidden';
        });
        canvas.addEventListener('mouseleave', () => {
          document.body.style.overflow = '';
        });

      } catch (err) {
        console.error('Globe init error:', err);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        setViewerRef(null);
      }
    };
  }, []); // one-time init

  // ── User location marker ──────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !userLocation) return;

    // Remove old
    if (entitiesRef.current.userMarker) {
      viewer.entities.remove(entitiesRef.current.userMarker);
    }

    const entity = viewer.entities.add({
      id: 'user-location',
      position: Cartesian3.fromDegrees(userLocation.lng, userLocation.lat, 0),
      billboard: {
        image: createPulsingDot('#00d9ff'),
        width: 24,
        height: 24,
        verticalOrigin: VerticalOrigin.CENTER,
        horizontalOrigin: HorizontalOrigin.CENTER,
        heightReference: HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new NearFarScalar(1e3, 2.0, 1e7, 0.8),
      },
      label: {
        text: '📍 You',
        font: '12px Inter, sans-serif',
        fillColor: Color.fromCssColorString('#00d9ff'),
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cartesian2(0, -20),
        heightReference: HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new NearFarScalar(1e3, 1.2, 1e7, 0.5),
      },
    });

    entitiesRef.current.userMarker = entity;
  }, [userLocation]);

  // ── ISS marker ───────────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !issData) return;

    const pos = issData.positions?.[0];
    if (!pos) return;

    if (entitiesRef.current.iss) {
      viewer.entities.remove(entitiesRef.current.iss);
    }

    const entity = viewer.entities.add({
      id: 'iss',
      satelliteData: {
        satname: 'ISS (International Space Station)',
        satid: 25544,
        satlat: pos.satlat,
        satlng: pos.satlng,
        satalt: pos.satalt || 408,
        velocity: issData.iss_speed || 0,
        inclination: 51.6,
        category: 'space-station',
        ...pos
      },
      position: Cartesian3.fromDegrees(pos.satlng, pos.satlat, (pos.satalt || 408) * 1000),
      billboard: {
        image: createSatelliteIcon('#ffd700', '🛸'),
        width: 32,
        height: 32,
        verticalOrigin: VerticalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new NearFarScalar(1e5, 2.0, 2e7, 0.4),
      },
      label: {
        text: 'ISS',
        font: '11px "JetBrains Mono", monospace',
        fillColor: Color.GOLD,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cartesian2(20, 0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new NearFarScalar(1e5, 1.2, 2e7, 0.4),
      },
    });

    entitiesRef.current.iss = entity;

    // If tracking ISS, fly camera to it
    if (isTrackingISS) {
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(pos.satlng, pos.satlat, 2_500_000),
        duration: 2.5,
      });
    }
  }, [issData, isTrackingISS]);

  // ── Category satellite markers + orbit paths ─────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Remove old satellite entities
    entitiesRef.current.satellites.forEach(e => {
      try { viewer.entities.remove(e); } catch (_) {}
    });
    entitiesRef.current.satellites = [];

    // Clear old orbit lines
    if (orbitLinesRef.current) orbitLinesRef.current.removeAll();

    if (!satellites || satellites.length === 0) return;

    const color    = CAT_COLORS[satelliteCategory] || Color.WHITE;
    const hexColor = colorToHex(color);

    satellites.slice(0, 30).forEach((sat, idx) => {
      const lat  = sat.satlat ?? sat.decl ?? 0;
      const lng  = sat.satlng ?? sat.ra   ?? 0;
      const alt  = (sat.satalt ?? 500) * 1000; // km → m
      const name = sat.satname || `SAT-${idx}`;
      const isSelected = selectedSatellite?.satid === sat.satid;

      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return;

      const entity = viewer.entities.add({
        id: `sat-${sat.satid || idx}`,
        satelliteData: sat, // Store satellite data on entity for click handler
        position: Cartesian3.fromDegrees(lng, lat, alt),
        point: {
          pixelSize: isSelected ? 9 : 5,
          color: isSelected ? Color.MAGENTA : color.withAlpha(0.85),
          outlineColor: Color.WHITE.withAlpha(isSelected ? 0.9 : 0.4),
          outlineWidth: isSelected ? 2 : 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new NearFarScalar(1e5, 2.0, 3e7, 0.3),
        },
        label: {
          text: name.length > 15 ? name.substring(0, 14) + '…' : name,
          font: isSelected ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif',
          fillColor: isSelected ? Color.MAGENTA : color,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cartesian2(12, 0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new NearFarScalar(1e5, 1.2, 1e7, 0.1),
          translucencyByDistance: isSelected 
            ? new NearFarScalar(1e5, 1.0, 1e7, 1.0)
            : new NearFarScalar(5e5, 1, 1e7, 0),
        },
      });
      entitiesRef.current.satellites.push(entity);

      // ── Orbit path (simplified circular ring) ──────────────
      if (showOrbitPaths || isSelected) {
        const altM     = alt;
        const inclRad  = ((sat.inclination ?? 51.6) * Math.PI) / 180;
        const pts      = [];
        const steps    = 120;

        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * 2 * Math.PI;
          // Simplified orbit in orbital plane, then rotate by inclination
          const x = Math.cos(theta);
          const y = Math.sin(theta) * Math.cos(inclRad);
          const z = Math.sin(theta) * Math.sin(inclRad);
          const R = 6_371_000 + altM;
          pts.push(new Cartesian3(x * R, y * R, z * R));
        }

        const orbitEntity = viewer.entities.add({
          id: `orbit-${sat.satid || idx}`,
          polyline: {
            positions: pts,
            width: isSelected ? 3 : 2,
            material: isSelected
              ? new PolylineOutlineMaterialProperty({
                  color: Color.MAGENTA.withAlpha(0.8),
                  outlineColor: Color.MAGENTA.withAlpha(0.4),
                  outlineWidth: 1.5,
                })
              : new PolylineOutlineMaterialProperty({
                  color: color.withAlpha(0.6),
                  outlineColor: color.withAlpha(0.3),
                  outlineWidth: 1,
                }),
            clampToGround: false,
          },
        });
        entitiesRef.current.satellites.push(orbitEntity);
      }
    });
  }, [satellites, satelliteCategory, showOrbitPaths, selectedSatellite]);

  // ── Camera mode transitions ───────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Keep Earth readable + allow planets to be visible (don’t zoom so far away)
    const targetLng = userLocation?.lng ?? 0;
    const targetLat = userLocation?.lat ?? 20;

    if (cameraMode === 'space') {
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(targetLng, targetLat, 26_000_000),
        orientation: {
          heading: 0,
          pitch: CesiumMath.toRadians(-10),
          roll: 0,
        },
        duration: 2.8,
        easingFunction: easingInOut,
      });

      // Make distance-based labels/items easier to see in this mode
      viewer.scene.fog.density = 0.00003;
    } else {
      viewer.scene.fog.density = 0.0001;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(targetLng, targetLat, 18_000_000),
        orientation: {
          heading: 0,
          pitch: CesiumMath.toRadians(-25),
          roll: 0,
        },
        duration: 2.4,
        easingFunction: easingInOut,
      });
    }
  }, [cameraMode, userLocation]);


  // ── Planet rendering (space mode) ───────────────────────────
  useEffect(() => {

    const viewer = viewerRef.current;
    if (!viewer) return;

    // Clear old planet entities
    if (entitiesRef.current.planets?.length) {
      entitiesRef.current.planets.forEach((e) => {
        try { viewer.entities.remove(e); } catch (_) {}
      });
    }
    entitiesRef.current.planets = [];

    if (!cameraMode || cameraMode !== 'space') return;
    if (!bodiesData?.data?.table?.rows) return;

    const rows = bodiesData.data.table.rows;
    const planetIds = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    const planetRows = rows.filter((r) => {
      const name = r?.entry?.id || r?.entry?.name;
      const n = (name || '').toLowerCase();
      return planetIds.includes(n);
    });

    const radiusBase = 6_371_000;
    const planetColors = {
      mercury: Color.fromCssColorString('#a3a3a3'),
      venus: Color.fromCssColorString('#facc15'),
      mars: Color.fromCssColorString('#fb7185'),
      jupiter: Color.fromCssColorString('#f59e0b'),
      saturn: Color.fromCssColorString('#fde68a'),
    };

    // Hackathon positioning: place planets relative to user location direction using alt/az
    // AstronomyAPI bodies positions include horizontal altitude/azimuth; we approximate a ray.
    const userAltM = 1_500_000;

    planetRows.forEach((r, idx) => {
      const entryName = (r?.entry?.name || r?.entry?.id || '').toLowerCase();
      if (!planetIds.includes(entryName)) return;

      const cell = r?.cells?.[0];
      const altitudeDeg = Number(cell?.position?.horizontal?.altitude?.degrees ?? 0);
      const azimuthDeg = Number(cell?.position?.horizontal?.azimuth?.degrees ?? 0);

      // If not above horizon, still render in space mode but dim.
      const visible = altitudeDeg > 0;

      // Approx “distance from observer” in meters: astronomy cells may contain distance; fallback.
      const distKm = Number(
        cell?.distance?.fromEarth?.km ??
        cell?.distance?.toEarth?.km ??
        50_000_000
      );
      const distM = (Number.isFinite(distKm) ? distKm : 50_000_000) * 1000;

      const az = CesiumMath.toRadians(azimuthDeg);
      const alt = CesiumMath.toRadians(altitudeDeg);

      // Create a local ENU direction and step outward.
      const lat = userLocation?.lat ?? 20;
      const lng = userLocation?.lng ?? 0;

      // Convert the user geodetic point to cartesian at a modest altitude.
      const origin = Cartesian3.fromDegrees(lng, lat, userAltM);
      const up = viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
        origin,
        new Cartesian3()
      );

      // Build east and north vectors on the ellipsoid.
      const east = Cartesian3.normalize(
        Cartesian3.cross(
          up,
          Cartesian3.UNIT_Z,
          new Cartesian3()
        ),
        new Cartesian3()
      );
      const north = Cartesian3.normalize(Cartesian3.cross(east, up, new Cartesian3()), new Cartesian3());

      // Horizontal direction based on azimuth (az=0 north, 90 east)
      const horiz = new Cartesian3(
        north.x * Math.cos(az) + east.x * Math.sin(az),
        north.y * Math.cos(az) + east.y * Math.sin(az),
        north.z * Math.cos(az) + east.z * Math.sin(az)
      );

      const dir = Cartesian3.normalize(
        new Cartesian3(
          horiz.x * Math.cos(alt) + up.x * Math.sin(alt),
          horiz.y * Math.cos(alt) + up.y * Math.sin(alt),
          horiz.z * Math.cos(alt) + up.z * Math.sin(alt)
        ),
        new Cartesian3()
      );

      const position = Cartesian3.add(origin, Cartesian3.multiplyByScalar(dir, distM, new Cartesian3()), new Cartesian3());

      const color = planetColors[entryName] || Color.WHITE;
      const scale = entryName === 'jupiter' ? 2.2 : entryName === 'saturn' ? 1.8 : 1.4;

      // Planet entity
      const planetEntity = viewer.entities.add({
        id: `planet-${entryName}`,
        planetData: {
          name: entryName.charAt(0).toUpperCase() + entryName.slice(1),
          emoji: entryName === 'jupiter' ? '♃' : entryName === 'saturn' ? '♄' : entryName === 'mars' ? '♂' : entryName === 'venus' ? '♀' : '☿',
          visible,
          altitude: altitudeDeg.toFixed(1),
          azimuth: azimuthDeg.toFixed(1),
          distance: distKm ? `${Math.round(distKm).toLocaleString()} km` : '—',
          magnitude: cell?.extraInfo?.magnitude?.value ?? '—',
          moons: entryName === 'jupiter' ? 95 : entryName === 'saturn' ? 146 : 0,
          rings: entryName === 'saturn',
          activity: entryName === 'jupiter'
            ? 'Jupiter is the solar system’s largest planet—lots of moons and storms.'
            : entryName === 'saturn'
              ? 'Saturn’s rings dominate its appearance. Explore the rings by clicking.'
              : 'A bright planet in the night sky—check altitude/azimuth in the panel.',
        },
        position,
        ellipsoid: {
          radii: new Cartesian3(55_000 * scale, 55_000 * scale, 55_000 * scale),
          material: color.withAlpha(visible ? 0.95 : 0.25),
          outline: false,
        },
        label: {
          text: visible ? entryName.toUpperCase() : '',
          font: '11px "JetBrains Mono", monospace',
          fillColor: color,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          pixelOffset: new Cartesian2(0, 18),
          showBackground: true,
          backgroundColor: Color.BLACK.withAlpha(0.35),
        },
      });

      entitiesRef.current.planets.push(planetEntity);

      // Saturn rings (simple flat ellipse approximation)
      if (entryName === 'saturn') {
        viewer.entities.add({
          id: `ring-${entryName}`,
          position,
          ellipse: {
            semiMajorAxis: 120_000,
            semiMinorAxis: 40_000,
            height: 0,
            material: Color.fromCssColorString('#c7c7c7').withAlpha(0.35),
            outline: true,
            outlineColor: Color.fromCssColorString('#e5e7eb').withAlpha(0.5),
          },
        });
      }

      // Orbit ring around Earth-ish reference (visual only)
      // Use a simple circle in the ECEF-ish frame by sampling at fixed radius.
      const showOrbit = true;
      if (showOrbit && cameraMode === 'space') {
        const altM = 50_000_000; // purely visual
        const incl = entryName === 'jupiter' ? 0.4 : entryName === 'saturn' ? 0.3 : 0.2;
        const steps = 96;
        const pts = [];
        const x0 = 0, y0 = 0, z0 = 0;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * 2 * Math.PI;
          const x = Math.cos(t);
          const y = Math.sin(t) * Math.cos(incl);
          const z = Math.sin(t) * Math.sin(incl);
          const R = radiusBase + altM;
          pts.push(new Cartesian3(x * R + x0, y * R + y0, z * R + z0));
        }
        const orbitEntity = viewer.entities.add({
          id: `orbit-ring-${entryName}`,
          polyline: {
            positions: pts,
            width: 1.5,
            material: new PolylineOutlineMaterialProperty({
              color: color.withAlpha(0.45),
              outlineColor: color.withAlpha(0.15),
              outlineWidth: 1,
            }),
            clampToGround: false,
          },
        });
        entitiesRef.current.planets.push(orbitEntity);
      }

      // Starfield-like burst: optional (handled in its own effect)
    });
  }, [cameraMode, bodiesData, userLocation]);

  // ── Sky View Mode (look up at the sky) ──────────────────────
  useEffect(() => {

    const viewer = viewerRef.current;
    if (!viewer || !userLocation) return;

    if (isSkyViewMode) {
      // Sky view: position camera near ground, looking up at sky
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          userLocation.lng,
          userLocation.lat,
          100_000 // 100 km altitude for good satellite viewing
        ),
        orientation: {
          heading: 0,
          pitch: CesiumMath.toRadians(75), // 75 degrees upward = nearly straight up
          roll: 0,
        },
        duration: 2.0,
        easingFunction: easingInOut,
      });
      console.log('Sky view enabled at:', userLocation.lat, userLocation.lng);
    } else {
      // Return to normal view
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          userLocation.lng,
          userLocation.lat,
          1_500_000 // 1.5M km for normal view
        ),
        orientation: {
          heading: 0,
          pitch: CesiumMath.toRadians(-45),
          roll: 0,
        },
        duration: 2.0,
        easingFunction: easingInOut,
      });
      console.log('Returned to globe view');
    }
  }, [isSkyViewMode, userLocation]);

  // ── Terrain toggle ────────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.scene.globe.showGroundAtmosphere = showAtmosphere;
    viewer.scene.skyAtmosphere.show          = showAtmosphere;
  }, [showAtmosphere]);

  // ── Track selected satellite camera ───────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isTrackingSelectedSat || !selectedSatellite) return;

    // Find current selected satellite position
    const currentSat = satellites.find(s => s.satid === selectedSatellite.satid) || selectedSatellite;
    const lat = currentSat.satlat ?? currentSat.decl;
    const lng = currentSat.satlng ?? currentSat.ra;
    const alt = currentSat.satalt ?? 500;

    if (lat !== undefined && lng !== undefined) {
      const { Cartesian3 } = window.Cesium || {};
      if (Cartesian3) {
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(lng, lat, alt * 1000 + 1_500_000),
          duration: 2.5,
        });
      }
    }
  }, [satellites, selectedSatellite, isTrackingSelectedSat]);



  return (
    <div
      ref={containerRef}
      id="cesium-container"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
};

// ── Helpers ──────────────────────────────────────────────────────

/** Create a pulsing dot canvas image */
function createPulsingDot(hexColor) {
  const size = 24;
  const canvas = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const r = size / 2;
  ctx.clearRect(0, 0, size, size);
  // Outer ring
  ctx.beginPath();
  ctx.arc(r, r, r - 2, 0, Math.PI * 2);
  ctx.strokeStyle = hexColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  // Inner dot
  ctx.beginPath();
  ctx.arc(r, r, 5, 0, Math.PI * 2);
  ctx.fillStyle = hexColor;
  ctx.globalAlpha = 1;
  ctx.fill();
  return canvas.toDataURL();
}

/** Create a small satellite icon canvas */
function createSatelliteIcon(hexColor) {
  const size = 28;
  const canvas = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const r = size / 2;
  ctx.clearRect(0, 0, size, size);
  // Glow
  ctx.shadowColor = hexColor;
  ctx.shadowBlur  = 8;
  // Body
  ctx.beginPath();
  ctx.arc(r, r, 7, 0, Math.PI * 2);
  ctx.fillStyle = hexColor;
  ctx.fill();
  // Solar panels
  ctx.fillStyle = hexColor;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(r - 12, r - 2, 6, 4);  // left panel
  ctx.fillRect(r + 6,  r - 2, 6, 4);  // right panel
  return canvas.toDataURL();
}

function colorToHex(cesiumColor) {
  const r = Math.round(cesiumColor.red   * 255).toString(16).padStart(2, '0');
  const g = Math.round(cesiumColor.green * 255).toString(16).padStart(2, '0');
  const b = Math.round(cesiumColor.blue  * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function easingInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default Globe;
