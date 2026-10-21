import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { LAYER_COLORS } from '../constants/layers'
import type { LayerId, Spot, UserSpot } from '../utils/map'

const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

function zoomFor(radiusM: number): number {
  if (radiusM <= 3000) return 14
  if (radiusM <= 6000) return 13
  return 12
}

function pinIcon(layer: LayerId, mine = false): L.DivIcon {
  const dashed = mine ? 'border-style:dashed;' : ''
  return L.divIcon({
    className: '',
    html: `<span class="pf-pin" style="display:block;background:${LAYER_COLORS[layer]};${dashed}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -9],
  })
}

export interface MapLabels {
  unnamed: string
  openOsm: string
  accepts: string
  layers: Record<LayerId, string>
  materials: Record<string, string>
  away: (km: string) => string
}

interface MapViewProps {
  center: { lat: number; lon: number }
  radiusM: number
  spots: Spot[]
  mySpots: UserSpot[]
  selectedId: string | null
  addMode: boolean
  pending: { lat: number; lon: number } | null
  onMapClick: (lat: number, lon: number) => void
  labels: MapLabels
}

/** Builds popup content from DOM nodes, never from HTML strings: names come from volunteers. */
function popupFor(title: string, lines: string[], link?: { href: string; text: string }): HTMLElement {
  const root = document.createElement('div')
  root.style.cssText = 'font:500 13px/1.4 Inter Tight,system-ui,sans-serif;color:#111;min-width:140px'
  const heading = document.createElement('strong')
  heading.textContent = title
  heading.style.cssText = 'display:block;font-size:14px;margin-bottom:2px'
  root.appendChild(heading)
  for (const line of lines) {
    const p = document.createElement('div')
    p.textContent = line
    p.style.color = '#555'
    root.appendChild(p)
  }
  if (link) {
    const a = document.createElement('a')
    a.href = link.href
    a.target = '_blank'
    a.rel = 'noreferrer noopener'
    a.textContent = link.text
    a.style.cssText = 'display:inline-block;margin-top:6px;color:#1e6ef3'
    root.appendChild(a)
  }
  return root
}

export function MapView({ center, radiusM, spots, mySpots, selectedId, addMode, pending, onMapClick, labels }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerLayer = useRef<L.LayerGroup | null>(null)
  const areaLayer = useRef<L.LayerGroup | null>(null)
  const markers = useRef(new Map<string, L.Marker>())
  const clickRef = useRef(onMapClick)
  const addModeRef = useRef(addMode)

  useEffect(() => {
    clickRef.current = onMapClick
    addModeRef.current = addMode
    if (containerRef.current) containerRef.current.style.cursor = addMode ? 'crosshair' : ''
  }, [onMapClick, addMode])

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const map = L.map(container, { center: [center.lat, center.lon], zoom: zoomFor(radiusM), zoomControl: true, attributionControl: true })
    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19, className: 'pf-tiles' }).addTo(map)
    markerLayer.current = L.layerGroup().addTo(map)
    areaLayer.current = L.layerGroup().addTo(map)
    map.on('click', (event: L.LeafletMouseEvent) => {
      if (addModeRef.current) clickRef.current(event.latlng.lat, event.latlng.lng)
    })
    mapRef.current = map
    const markerMap = markers.current
    return () => {
      map.remove()
      mapRef.current = null
      markerLayer.current = null
      areaLayer.current = null
      markerMap.clear()
    }
    // The map is created once; later center and radius changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-centre and draw the search area.
  useEffect(() => {
    const map = mapRef.current
    const layer = areaLayer.current
    if (!map || !layer) return
    map.setView([center.lat, center.lon], zoomFor(radiusM))
    layer.clearLayers()
    L.circle([center.lat, center.lon], { radius: radiusM, color: '#1e6ef3', weight: 1, dashArray: '4 6', fillOpacity: 0.03, interactive: false }).addTo(layer)
  }, [center.lat, center.lon, radiusM])

  // Redraw markers whenever the data changes.
  useEffect(() => {
    const layer = markerLayer.current
    if (!layer) return
    layer.clearLayers()
    markers.current.clear()

    for (const spot of spots) {
      const marker = L.marker([spot.lat, spot.lon], { icon: pinIcon(spot.layer), title: spot.name ?? labels.unnamed })
      const lines = [labels.layers[spot.layer], labels.away(spot.distanceKm.toFixed(1))]
      if (spot.materials.length > 0) lines.push(`${labels.accepts}: ${spot.materials.map((m) => labels.materials[m] ?? m.replace(/_/g, ' ')).join(', ')}`)
      marker.bindPopup(popupFor(spot.name ?? labels.unnamed, lines, { href: spot.osmUrl, text: labels.openOsm }))
      marker.addTo(layer)
      markers.current.set(spot.id, marker)
    }

    for (const mine of mySpots) {
      const marker = L.marker([mine.lat, mine.lon], { icon: pinIcon(mine.layer, true), title: mine.name })
      marker.bindPopup(popupFor(mine.name, [labels.layers[mine.layer]]))
      marker.addTo(layer)
      markers.current.set(mine.id, marker)
    }

    if (pending) {
      L.circleMarker([pending.lat, pending.lon], { radius: 8, color: '#ffffff', weight: 2, fillColor: '#1e6ef3', fillOpacity: 1 }).addTo(layer)
    }
  }, [spots, mySpots, pending, labels])

  // Fly to the spot chosen in the list.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedId) return
    const marker = markers.current.get(selectedId)
    if (!marker) return
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 16), { duration: 0.8 })
    marker.openPopup()
  }, [selectedId])

  return <div ref={containerRef} className="h-full w-full" role="application" aria-label="Map" />
}
