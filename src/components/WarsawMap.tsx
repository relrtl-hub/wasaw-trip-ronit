import { CircleMarker, MapContainer, Popup, Polyline, Tooltip, useMap } from 'react-leaflet'
import { tileLayer, type LatLngBoundsExpression } from 'leaflet'
import { useEffect } from 'react'
import { categoryLabels, type Place } from '../data/places'
import type { TripRoute } from '../data/routes'
import { formatDistance, formatDuration, type RouteResult } from '../lib/routing'

type WarsawMapProps = {
  places: Place[]
  routeDisplays: Array<{ route: TripRoute; result: RouteResult }>
  selectedSegment?: { routeId: string; segmentIndex: number } | null
  onSegmentSelect?: (routeId: string, segmentIndex: number) => void
  onPlaceSelect?: (place: Place) => void
  showPlaceLabels?: boolean
  highlightedPlaceId?: string | null
  mapLayer?: MapLayer
}

export type MapLayer = 'imagery' | 'osm'

const bounds: LatLngBoundsExpression = [
  [52.217, 20.991],
  [52.264, 21.058],
]

const colors: Record<string, string> = {
  hotel: '#1d3037',
  shopping: '#c68431',
  food: '#c86452',
  history: '#805573',
  dance: '#4a78a4',
  area: '#70955d',
}

function FitWarsaw() {
  const map = useMap()

  useEffect(() => {
    map.fitBounds(bounds, { padding: [18, 18] })
  }, [map])

  return null
}

function FocusPlace({ place }: { place?: Place }) {
  const map = useMap()

  useEffect(() => {
    if (place) map.setView([place.lat, place.lon], 16, { animate: true })
  }, [map, place])

  return null
}

function BasemapLayer({ mapLayer }: { mapLayer: MapLayer }) {
  const map = useMap()

  useEffect(() => {
    const isOsm = mapLayer === 'osm'
    const layer = tileLayer(
      isOsm
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: isOsm
          ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          : 'Sources: <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community',
      },
    ).addTo(map)
    map.attributionControl.setPrefix(isOsm ? 'Street names via OpenStreetMap' : 'Imagery basemap')
    return () => { map.removeLayer(layer) }
  }, [map, mapLayer])

  return null
}

export function WarsawMap({ places, routeDisplays, selectedSegment = null, onSegmentSelect, onPlaceSelect, showPlaceLabels = true, highlightedPlaceId = null, mapLayer = 'imagery' }: WarsawMapProps) {
  const routeStopIds = new Set(routeDisplays.flatMap(({ route }) => route.segments.flatMap((segment) => [segment.from, segment.to])))
  const routeLegs = routeDisplays.flatMap(({ route, result }) => result.legs.flatMap((leg, index) => leg.geometry.length > 1 ? [{ route, leg, index }] : []))
  const orderedRouteLegs = [
    ...routeLegs.filter(({ route, index }) => selectedSegment?.routeId !== route.id || selectedSegment.segmentIndex !== index),
    ...routeLegs.filter(({ route, index }) => selectedSegment?.routeId === route.id && selectedSegment.segmentIndex === index),
  ]

  return (
    <MapContainer className="real-map" key={mapLayer} bounds={bounds} scrollWheelZoom>
      <BasemapLayer mapLayer={mapLayer} />
      <FitWarsaw />
      <FocusPlace place={places.find((place) => place.id === highlightedPlaceId)} />
      {orderedRouteLegs.map(({ route, leg, index }) => {
        const isSelected = selectedSegment?.routeId === route.id && selectedSegment.segmentIndex === index
        return (
          <Polyline
            key={`${route.id}-${leg.segment.from}-${leg.segment.to}`}
            eventHandlers={{ click: () => onSegmentSelect?.(route.id, index) }}
            pathOptions={{
              color: isSelected ? '#f0a52b' : route.color,
              dashArray: leg.segment.optional ? '9 8' : undefined,
              opacity: isSelected ? 1 : leg.source === 'fallback' ? 0.55 : leg.segment.optional ? 0.72 : 0.88,
              weight: isSelected ? 9 : leg.segment.optional ? 4 : 5,
            }}
            positions={leg.geometry}
          >
            <Tooltip className="segment-label" direction="center" permanent>
              {index + 1}
            </Tooltip>
            <Popup>
              <div className="route-popup">
                <div className="place-popup route-popup-summary">
                  <span className="popup-category">{route.title} · {leg.source === 'fallback' ? 'Approximate directions' : leg.segment.mode === 'walking' ? 'Walking directions' : 'Taxi directions'}</span>
                  <strong>{formatDistance(leg.distanceMeters)} · {formatDuration(leg.durationSeconds)}</strong>
                  <small>{leg.source === 'fallback' ? 'Live routing was unavailable for this leg.' : leg.source === 'bundled' ? 'Verified street route, bundled for offline display.' : leg.segment.optional ? 'Optional segment, shown dashed.' : 'Tap the route to highlight this segment.'}</small>
                </div>
                <ol className="route-instructions">
                  {(leg.steps.length ? leg.steps : [{
                    instruction: leg.segment.instruction ?? 'Follow the route to the next stop.',
                    distanceMeters: leg.distanceMeters,
                    durationSeconds: leg.durationSeconds,
                  }]).map((step, stepIndex) => (
                    <li key={`${route.id}-${leg.segment.from}-${leg.segment.to}-${stepIndex}`}>
                      <span>{step.instruction}</span>
                      <small>{formatDistance(step.distanceMeters)} · {formatDuration(step.durationSeconds)}{leg.source === 'fallback' ? ' · approximate' : ''}</small>
                    </li>
                  ))}
                </ol>
              </div>
            </Popup>
          </Polyline>
        )
      })}
      {places.map((place) => (
        <CircleMarker
          center={[place.lat, place.lon]}
          color={highlightedPlaceId === place.id ? '#f0a52b' : place.addedByAssistant ? '#e1a43d' : '#ffffff'}
          eventHandlers={{ click: () => onPlaceSelect?.(place) }}
          fillColor={routeStopIds.has(place.id) ? colors[place.category] : colors[place.category]}
          fillOpacity={highlightedPlaceId === place.id ? 1 : routeStopIds.has(place.id) ? 1 : 0.8}
          key={place.id}
          radius={highlightedPlaceId === place.id ? 11 : place.category === 'hotel' ? 9 : place.addedByAssistant ? 8 : routeStopIds.has(place.id) ? 8 : 6}
          weight={highlightedPlaceId === place.id ? 4 : place.addedByAssistant || routeStopIds.has(place.id) ? 3 : 2}
        >
          {showPlaceLabels && (
            <Tooltip className="map-point-label" direction="top" offset={[0, -7]} permanent>
              {place.addedByAssistant ? `✦ ${place.name}` : place.name}
            </Tooltip>
          )}
          <Popup>
            <div className="place-popup">
              <span className="popup-category">{place.addedByAssistant ? '✦ Added by assistant' : categoryLabels[place.category]}</span>
              <strong>{place.name}</strong>
              <span>{place.address}</span>
              {place.rating && <span className="place-rating">★ {place.rating.toFixed(1)} Google</span>}
              {place.price && <span>{place.price}</span>}
              {place.hours && <span>{place.hours}</span>}
              {place.tags?.length ? <div className="place-tags">{place.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
              <small>{place.note}</small>
              <a href={place.googleMapsUrl} rel="noreferrer" target="_blank">Open in Google Maps ↗</a>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
