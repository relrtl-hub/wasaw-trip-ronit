import type { Place } from './places'

export type DayKey = 'day1' | 'day2' | 'day3'
export type TravelMode = 'walking' | 'driving'

export type RouteSegment = {
  from: string
  to: string
  mode: TravelMode
  optional?: boolean
  instruction?: string
}

export type TripRoute = {
  id: string
  day: DayKey
  time: string
  title: string
  description: string
  color: string
  segments: RouteSegment[]
}

export const routes: TripRoute[] = [
  {
    id: 'day1-gromada-viva',
    day: 'day1',
    time: '10:00',
    title: 'Gromada → Viva Club',
    description: 'Walk from Hotel Gromada to Viva Club.',
    color: '#d49b3c',
    segments: [
      {
        from: 'hotel-gromada',
        to: 'viva-cuba',
        mode: 'walking',
        instruction: 'Walk west from Hotel Gromada to Viva Club.',
      },
    ],
  },
  {
    id: 'day2-gromada-zlote-viva',
    day: 'day2',
    time: '10:00',
    title: 'Gromada → Złote Tarasy → Viva Club',
    description: 'Walk from Hotel Gromada to Złote Tarasy, then continue to Viva Club.',
    color: '#438b89',
    segments: [
      {
        from: 'hotel-gromada',
        to: 'zlote-tarasy',
        mode: 'walking',
        instruction: 'Walk west from Hotel Gromada to Złote Tarasy.',
      },
      {
        from: 'zlote-tarasy',
        to: 'viva-cuba',
        mode: 'walking',
        instruction: 'Continue north-west from Złote Tarasy to Viva Club.',
      },
    ],
  },
  {
    id: 'day3-gromada-manufaktura',
    day: 'day3',
    time: '10:00',
    title: 'Gromada → Manufaktura Cukierków',
    description: 'Walk from Hotel Gromada to Manufaktura Cukierków on Nowy Świat.',
    color: '#4a78a4',
    segments: [
      {
        from: 'hotel-gromada',
        to: 'manufaktura-cukierkow',
        mode: 'walking',
        instruction: 'Walk north-west from Hotel Gromada to Manufaktura Cukierków.',
      },
    ],
  },
]

export const routesForDay = (day: DayKey) => routes.filter((route) => route.day === day)

export function googleDirectionsUrl(route: TripRoute, places: Place[]) {
  const plannedSegments = route.segments.filter((segment) => !segment.optional)
  const stopIds = [plannedSegments[0].from, ...plannedSegments.map((segment) => segment.to)]
  const stops = stopIds.map((id) => places.find((place) => place.id === id)).filter((place): place is Place => Boolean(place))
  const origin = stops[0]
  const destination = stops[stops.length - 1]
  const waypoints = stops.slice(1, -1).map((place) => `${place.lat},${place.lon}`).join('|')
  const mode = route.segments.every((segment) => segment.mode === 'walking') ? 'walking' : 'driving'
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lon}`,
    destination: `${destination.lat},${destination.lon}`,
    travelmode: mode,
  })
  if (waypoints) params.set('waypoints', waypoints)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
