# TODO

## Space mode planets/orbits + click-to-info
- [x] Inspect existing Cesium scene code paths for camera mode + entity setup

- [x] Add planet + sun + orbit rendering to `frontend/src/components/Globe.jsx`

- [ ] Add star field rendering in `Globe.jsx` (simple point sprites for space mode)
- [ ] Wire click handler to pick planet entities and open a new planet info popup
- [ ] Implement `PlanetInfoPopup` component
- [ ] Extend app state in `frontend/src/context/store.js` for selected planet
- [ ] Map AstronomyAPI `bodiesData` planet rows into Cesium planet entities for positioning

## Fix bug: Earth <-> Space camera transition
- [x] Adjust `cameraMode` transition in `Globe.jsx` so Earth doesn’t become unusably small and planets remain visible

- [ ] Verify transitions with different zoom distances

## Moon count / extra activity
- [ ] Provide moon count using a small hardcoded dataset (hackathon-friendly)
- [ ] Show distance/alt-az from available AstronomyAPI fields

## Test
- [ ] Run frontend dev/build and validate toggle + click + popup
- [ ] Check for console errors

