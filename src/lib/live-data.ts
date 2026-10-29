export type WeatherDay = {
  date: string
  high: number
  low: number
  rainProbability: number
  rainHours: number
  code: number
  rainWindow: string
}

export type WeatherStatus = {
  days: WeatherDay[]
  fetchedAt: string
  source: string
}

export type CurrencyStatus = {
  plnPerEur: number
  eurPerPln: number
  eurPerIls: number
  fetchedAt: string
  source: string
}

const TRIP_DATES = ['2026-11-02', '2026-11-03', '2026-11-04']
const CACHE_MINUTES = 30
const cacheKey = (key: string) => `warsaw-trip-ronit:${key}`

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(cacheKey(key))
    if (!raw) return null
    const cached = JSON.parse(raw) as { savedAt: number; value: T }
    return Date.now() - cached.savedAt < CACHE_MINUTES * 60_000 ? cached.value : null
  } catch {
    return null
  }
}

function setCache<T>(key: string, value: T) {
  try { localStorage.setItem(cacheKey(key), JSON.stringify({ savedAt: Date.now(), value })) } catch { /* storage is optional */ }
}

const weatherLabel = (code: number) => {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 67) return 'Rain possible'
  if (code <= 77) return 'Snow possible'
  if (code <= 82) return 'Showers possible'
  return 'Storm risk'
}

function rainWindow(date: string, times: string[], probability: number[], precipitation: number[]) {
  const rainyHours = times.map((time, index) => ({
    time,
    hour: Number(time.slice(11, 13)),
    probability: probability[index] ?? 0,
    precipitation: precipitation[index] ?? 0,
  })).filter((item) => item.time.startsWith(date) && item.hour >= 8 && item.hour < 24 && (item.probability >= 40 || item.precipitation > 0.1))
  if (!rainyHours.length) return '08:00–24:00: no rain expected.'

  const windows: Array<{ start: number; end: number }> = []
  rainyHours.forEach(({ hour }) => {
    const current = windows[windows.length - 1]
    if (current && hour === current.end) current.end = hour + 1
    else windows.push({ start: hour, end: hour + 1 })
  })
  const formatHour = (hour: number) => `${String(hour % 24).padStart(2, '0')}:00`
  const windowText = windows.map((window) => `${formatHour(window.start)}–${formatHour(window.end)}`).join(', ')
  const hourCount = rainyHours.length
  return `08:00–24:00: rain possible ${windowText} (${hourCount} ${hourCount === 1 ? 'hour' : 'hours'}).`
}

function daytimeRainProbability(date: string, times: string[], probability: number[]) {
  const values = times.map((time, index) => ({
    time,
    hour: Number(time.slice(11, 13)),
    probability: probability[index] ?? 0,
  })).filter((item) => item.time.startsWith(date) && item.hour >= 8 && item.hour < 24)
  return values.reduce((maximum, item) => Math.max(maximum, item.probability), 0)
}

export async function fetchWeather(): Promise<WeatherStatus> {
  const cached = getCache<WeatherStatus>('weather-v2')
  if (cached) return cached
  const params = new URLSearchParams({
    latitude: '52.2301', longitude: '21.0171',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_hours,weather_code',
    hourly: 'precipitation_probability,precipitation',
    timezone: 'Europe/Warsaw', forecast_days: '16',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`)
  const payload = await response.json()
  const days: WeatherDay[] = TRIP_DATES.map((date) => {
    const index = payload.daily.time.indexOf(date)
    return {
      date,
      high: payload.daily.temperature_2m_max[index],
      low: payload.daily.temperature_2m_min[index],
      rainProbability: daytimeRainProbability(date, payload.hourly.time, payload.hourly.precipitation_probability),
      rainHours: payload.daily.precipitation_hours[index],
      code: payload.daily.weather_code[index],
      rainWindow: rainWindow(date, payload.hourly.time, payload.hourly.precipitation_probability, payload.hourly.precipitation),
    }
  })
  const result = { days, fetchedAt: new Date().toISOString(), source: 'Open-Meteo' }
  setCache('weather-v2', result)
  return result
}

export async function fetchCurrency(): Promise<CurrencyStatus> {
  const cached = getCache<CurrencyStatus>('currency')
  if (cached) return cached
  const [plnResponse, eurResponse] = await Promise.all([
    fetch('https://api.frankfurter.dev/v1/latest?base=PLN&symbols=EUR'),
    fetch('https://open.er-api.com/v6/latest/EUR'),
  ])
  if (!plnResponse.ok || !eurResponse.ok) throw new Error('Currency request failed')
  const pln = await plnResponse.json()
  const eur = await eurResponse.json()
  const eurPerPln = pln.rates.EUR
  const result = {
    eurPerPln,
    plnPerEur: 1 / eurPerPln,
    eurPerIls: eur.rates.ILS,
    fetchedAt: new Date().toISOString(),
    source: 'Frankfurter + ExchangeRate-API',
  }
  setCache('currency', result)
  return result
}

export const weatherDescription = weatherLabel
export { TRIP_DATES }
