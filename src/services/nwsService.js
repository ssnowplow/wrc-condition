import { proxyFetch } from './apiClient.js'

// NWS grid point for Sellwood / Portland — PQR office, grid 112,97
const FORECAST_URL = 'https://api.weather.gov/gridpoints/PQR/112,97/forecast'
const HOURLY_URL   = 'https://api.weather.gov/gridpoints/PQR/112,97/forecast/hourly'

function parsePeriod(p) {
  if (!p) return null
  return {
    name: p.name,
    temp: p.temperature,
    tempUnit: p.temperatureUnit,
    windSpeed: p.windSpeed,
    windDir: p.windDirection,
    icon: p.icon,
    shortForecast: p.shortForecast,
    detailedForecast: p.detailedForecast,
    isDaytime: p.isDaytime,
    startTime: p.startTime,
  }
}

function extractWindMph(windSpeed) {
  // windSpeed is like "10 mph" or "10 to 15 mph" — take the higher value
  if (!windSpeed) return null
  const nums = windSpeed.match(/\d+/g)
  if (!nums) return null
  return parseInt(nums.at(-1), 10)
}

/**
 * Returns {
 *   current: { temp, windSpeedMph, windDir, shortForecast, ... },
 *   periods: [ up to 6 daily forecast periods ],
 *   fetchedAt,
 * }
 */
export async function fetchNWS() {
  const [forecastData, hourlyData] = await Promise.all([
    proxyFetch(FORECAST_URL),
    proxyFetch(HOURLY_URL),
  ])

  const hourlyPeriods = hourlyData?.properties?.periods ?? []
  const forecastPeriods = forecastData?.properties?.periods ?? []

  const currentPeriod = hourlyPeriods[0] ?? null
  const current = currentPeriod
    ? {
        temp: currentPeriod.temperature,
        tempUnit: currentPeriod.temperatureUnit,
        windSpeedMph: extractWindMph(currentPeriod.windSpeed),
        windDir: currentPeriod.windDirection,
        shortForecast: currentPeriod.shortForecast,
        icon: currentPeriod.icon,
      }
    : null

  // Take next 6 daily periods (daytime + overnight pairs, but just take all up to 6)
  const periods = forecastPeriods.slice(0, 6).map(parsePeriod)

  return { current, periods, fetchedAt: new Date() }
}
