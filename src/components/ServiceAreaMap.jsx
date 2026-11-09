import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import serviceAreaGeo from '../geo/service-area.json'
import { serviceArea } from '../data.js'

// Esri's dark gray canvas (base + labels). Served without an API key;
// attribution (rendered bottom-right by Leaflet) is required.
// Note: CARTO's keyless basemaps now return "API KEY REQUIRED" watermark tiles.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas'
const TILE_URL = `${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`
const LABELS_URL = `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`
const ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'

const OUTLINE = {
  color: '#ef7d22',
  weight: 2,
  opacity: 0.95,
  fillColor: '#ef7d22',
  fillOpacity: 0.14,
}

const OUTLINE_HOVER = {
  weight: 3,
  fillOpacity: 0.3,
}

export default function ServiceAreaMap() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const map = L.map(host, {
      // Scroll over a full-bleed section should scroll the page, not zoom.
      scrollWheelZoom: false,
      zoomControl: true,
    })

    L.tileLayer(TILE_URL, {
      attribution: ATTRIBUTION,
      maxZoom: 16,
    }).addTo(map)

    // Labels sit in their own pane above the city outlines (overlayPane is
    // z-index 400) and ignore the pointer so outline hover/tooltips still work.
    const labelsPane = map.createPane('labels')
    labelsPane.style.zIndex = 450
    labelsPane.style.pointerEvents = 'none'
    L.tileLayer(LABELS_URL, { maxZoom: 16, pane: 'labels' }).addTo(map)

    const shapes = L.geoJSON(serviceAreaGeo, {
      style: () => OUTLINE,
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name
        if (name) layer.bindTooltip(name, { sticky: true })
        layer.on({
          mouseover: () => layer.setStyle(OUTLINE_HOVER),
          mouseout: () => layer.setStyle(OUTLINE),
        })
      },
    }).addTo(map)

    map.fitBounds(shapes.getBounds(), { padding: [14, 14] })

    L.circleMarker(serviceArea.center, {
      radius: 5,
      color: '#fff',
      weight: 2,
      fillColor: '#ef7d22',
      fillOpacity: 1,
    })
      .addTo(map)
      .bindTooltip(serviceArea.label, { direction: 'top', offset: [0, -8] })

    // React 18 StrictMode mounts effects twice in dev — without this teardown
    // Leaflet throws "Map container is already initialized".
    return () => map.remove()
  }, [])

  return (
    <div className="map">
      <div
        ref={hostRef}
        className="map__canvas"
        role="application"
        aria-label="Map outlining the cities we install in across the Lower Mainland"
      />
    </div>
  )
}
