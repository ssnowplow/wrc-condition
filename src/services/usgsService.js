import { proxyFetch } from './apiClient.js'

// USGS station 14211720 — Willamette River at Portland (Hawthorne Bridge)
const STATION_ID = '14211720'
// 72255 = mean velocity (fps); 00010 = water temperature (°C)
const PARAMS = '72255,00010'
const BASE = 'https://waterservices.usgs.gov/nwis/iv/'

function latestValue(ts) {
  if (!ts?.values?.[0]?.value?.length) return null
  const v = ts.values[0].value.at(-1)
  if (!v || v.value === '-999999') return null
  return parseFloat(v.value)
}

/**
 * Returns { velocityFps, tempF, tempC, fetchedAt }
 * Any field may be null if the sensor is offline.
 */
export async function fetchUSGS() {
  const url =
    `${BASE}?format=json&sites=${STATION_ID}&parameterCd=${PARAMS}&siteStatus=active`

  const data = await proxyFetch(url)
  const series = data?.value?.timeSeries ?? []

  let velocityFps = null
  let tempC = null

  for (const ts of series) {
    const code = ts.variable?.variableCode?.[0]?.value
    if (code === '72255') velocityFps = latestValue(ts)
    if (code === '00010') tempC = latestValue(ts)
  }

  const tempF = tempC != null ? (tempC * 9) / 5 + 32 : null

  return { velocityFps, tempF, tempC, fetchedAt: new Date() }
}
