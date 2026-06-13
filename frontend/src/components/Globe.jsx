import { useEffect, useRef } from 'react';
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
  const entitiesRef   = useRef({ userMarker: null, iss: null, satellites: [], orbits: [] });
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
          if (picked?.id) {
            viewer.camera.flyTo({
              destination: picked.id.position?.getValue
                ? Cartesian3.fromElements(
                    ...Object.values(picked.id.position.getValue(viewer.clock.currentTime) ?? {})
                  )
                : viewer.camera.position,
              duration: 2.0,
            });
          }
        }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

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

      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return;

      const entity = viewer.entities.add({
        id: `sat-${sat.satid || idx}`,
        position: Cartesian3.fromDegrees(lng, lat, alt),
        point: {
          pixelSize: 5,
          color: color.withAlpha(0.85),
          outlineColor: Color.WHITE.withAlpha(0.4),
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new NearFarScalar(1e5, 2.0, 3e7, 0.3),
        },
        label: {
          text: name.length > 15 ? name.substring(0, 14) + '…' : name,
          font: '10px Inter, sans-serif',
          fillColor: color,
          outlineColor: Color.BLACK,
          outlineWidth: 1,
          style: LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cartesian2(10, 0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new NearFarScalar(1e5, 1.0, 1e7, 0),
          translucencyByDistance: new NearFarScalar(5e5, 1, 1e7, 0),
        },
      });
      entitiesRef.current.satellites.push(entity);

      // ── Orbit path (simplified circular ring) ──────────────
      if (showOrbitPaths) {
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
            width: 2,
            material: new PolylineOutlineMaterialProperty({
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
  }, [satellites, satelliteCategory, showOrbitPaths]);

  // ── Camera mode transitions ───────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (cameraMode === 'space') {
      // Fly away — Earth as a sphere
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          userLocation?.lng ?? 0,
          userLocation?.lat ?? 20,
          45_000_000
        ),
        orientation: {
          heading: 0,
          pitch: CesiumMath.toRadians(-15),
          roll: 0,
        },
        duration: 3.5,
        easingFunction: easingInOut,
      });
    } else {
      // Earth mode — standard zoom
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          userLocation?.lng ?? 0,
          userLocation?.lat ?? 20,
          18_000_000
        ),
        orientation: {
          heading: 0,
          pitch: CesiumMath.toRadians(-25),
          roll: 0,
        },
        duration: 3.0,
        easingFunction: easingInOut,
      });
    }
  }, [cameraMode]);

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
