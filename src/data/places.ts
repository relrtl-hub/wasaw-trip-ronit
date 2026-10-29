export type PlaceCategory = 'hotel' | 'shopping' | 'food' | 'history' | 'dance' | 'area'
export type PlaceGroup = 'core' | 'sightseeing' | 'shopping' | 'restaurants' | 'utilities'

export type Place = {
  id: string
  name: string
  category: PlaceCategory
  group?: PlaceGroup
  tags?: string[]
  addedByAssistant?: boolean
  userAdded?: boolean
  rating?: number
  ratingSource?: string
  price?: string
  hours?: string
  is24Hours?: boolean
  address: string
  lat: number
  lon: number
  note: string
  source: string
  googleMapsUrl: string
}

const googleMaps = (lat: number, lon: number, name: string) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(name)}`

export const places: Place[] = [
  {
    id: 'hotel-gromada',
    name: 'Hotel Gromada Warszawa Centrum',
    category: 'hotel',
    group: 'core',
    tags: ['Hotel anchor'],
    address: 'Pl. Powstańców Warszawy 2, 00-030 Warszawa',
    lat: 52.23424,
    lon: 21.0149,
    note: 'Ronit trip hotel anchor. All planned routes start here.',
    source: 'Hotel Gromada official contact page / OpenStreetMap geocoding',
    googleMapsUrl: googleMaps(52.23424, 21.0149, 'Hotel Gromada Warszawa Centrum'),
  },
  {
    id: 'viva-cuba',
    name: 'Viva Club',
    category: 'dance',
    group: 'core',
    tags: ['Dance club', 'Core place'],
    address: 'Marszałkowska 115, entrance from Przechodnia, 00-102 Warszawa',
    lat: 52.2415215,
    lon: 21.0028384,
    note: 'Viva Cuba Dance Studio, shown as Viva Club for this trip.',
    source: 'OpenStreetMap / Nominatim',
    googleMapsUrl: googleMaps(52.2415215, 21.0028384, 'Viva Cuba Dance Studio Warsaw'),
  },
  {
    id: 'urban-outfitters',
    name: 'Urban Outfitters',
    category: 'shopping',
    group: 'shopping',
    address: 'Dobra 42, 00-312 Warszawa',
    lat: 52.240774,
    lon: 21.0278317,
    note: 'Shopping stop at the former Elektrownia Powiśle complex.',
    source: 'User-provided address, building anchor verified with OpenStreetMap',
    googleMapsUrl: googleMaps(52.240774, 21.0278317, 'Urban Outfitters Elektrownia Powiśle'),
  },
  {
    id: 'tk-maxx',
    name: 'TK Maxx',
    category: 'shopping',
    group: 'shopping',
    address: 'Marszałkowska 104/122, 00-017 Warszawa',
    lat: 52.2316168,
    lon: 21.0111431,
    note: 'Department store stop in the central shopping corridor.',
    source: 'OpenStreetMap / Nominatim',
    googleMapsUrl: googleMaps(52.2316168, 21.0111431, 'TK Maxx Warszawa'),
  },
  {
    id: 'uniqlo',
    name: 'Uniqlo',
    category: 'shopping',
    group: 'shopping',
    address: 'Marszałkowska 116/122, 00-008 Warszawa',
    lat: 52.2331492,
    lon: 21.0102541,
    note: 'Shopping stop near TK Maxx on Marszałkowska.',
    source: 'User-provided address, geocoded with OpenStreetMap / Nominatim',
    googleMapsUrl: googleMaps(52.2331492, 21.0102541, 'Uniqlo Warszawa'),
  },
  {
    id: 'zlote-tarasy',
    name: 'Złote Tarasy',
    category: 'shopping',
    group: 'shopping',
    address: 'Złota 59, 00-120 Warszawa',
    lat: 52.2300714,
    lon: 21.0024449,
    note: 'Central shopping mall beside Warszawa Centralna.',
    source: 'OpenStreetMap / Nominatim',
    googleMapsUrl: googleMaps(52.2300714, 21.0024449, 'Złote Tarasy'),
  },
  {
    id: 'balagan',
    name: 'Balagan Flagship Store',
    category: 'shopping',
    group: 'shopping',
    address: 'Mysia 3, 2nd floor, 00-496 Warszawa',
    lat: 52.230493,
    lon: 21.0206829,
    note: 'Shoe and accessories store at the Mysia 3 building anchor.',
    source: 'User-provided address, building anchor verified with OpenStreetMap',
    googleMapsUrl: googleMaps(52.230493, 21.0206829, 'Balagan Flagship Store Mysia 3'),
  },
  {
    id: 'sweet-factory-store',
    name: 'Sweet Factory Store',
    category: 'shopping',
    group: 'shopping',
    tags: ['Added for Ronit'],
    address: 'Nowy Świat 58A, 00-363 Warszawa',
    lat: 52.235533,
    lon: 21.0186125,
    note: 'Sweet shop on Nowy Świat, added to Ronit’s shopping list.',
    source: 'OpenStreetMap / Nominatim geocoding',
    googleMapsUrl: googleMaps(52.235533, 21.0186125, 'Sweet Factory Store Warsaw'),
  },
  {
    id: 'manufaktura-cukierkow',
    name: 'Manufaktura Cukierków',
    category: 'shopping',
    group: 'shopping',
    tags: ['Added for Ronit'],
    address: 'Nowy Świat 51, 00-042 Warszawa',
    lat: 52.2354576,
    lon: 21.0181683,
    note: 'Candy workshop and shop on Nowy Świat, added to Ronit’s route.',
    source: 'OpenStreetMap / Nominatim geocoding',
    googleMapsUrl: googleMaps(52.2354576, 21.0181683, 'Manufaktura Cukierków Warsaw'),
  },
  {
    id: 'wielka-synagoga',
    name: 'Wielka Synagoga w Warszawie',
    category: 'history',
    group: 'sightseeing',
    tags: ['Jewish heritage', 'Added for Ronit'],
    address: 'Tłomackie, 00-088 Warszawa',
    lat: 52.2442219,
    lon: 21.002581,
    note: 'Historic former Great Synagogue site at Tłomackie.',
    source: 'OpenStreetMap / Nominatim geocoding',
    googleMapsUrl: googleMaps(52.2442219, 21.002581, 'Wielka Synagoga w Warszawie'),
  },
]

export const categoryLabels: Record<PlaceCategory, string> = {
  hotel: 'Hotel',
  shopping: 'Shopping',
  food: 'Food',
  history: 'History',
  dance: 'Dance',
  area: 'Area',
}

export const assistantAddedPlaces = places.filter((place) => place.addedByAssistant)
