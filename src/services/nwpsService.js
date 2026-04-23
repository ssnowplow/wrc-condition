import { proxyFetch } from './apiClient.js'

// NOAA NWPS gauge — Portland (PRTO3)
const GAUGE_ID = 'PRTO3'
const BASE = 'https://api.water.noaa.gov/nwps/v1/gauges'

/**
 * Returns { stageFt, flowCfs, floodStageFt, fetchedAt }
 * flowCfs and stageFt may be null if unavailable.
 */
export async function fetchNWPS() {
  const url = `${BASE}/${GAUGE_ID}/stageflow`
  const data = await proxyFetch(url)

  // The NWPS stageflow response shape:
  // { status, observed: { primary: [...], secondary: [...] }, forecast: {...} }
  const observed = data?.observed
  const primary = observed?.primary   // typically stage (ft)
  const secondary = observed?.secondary // typically flow (cfs)

  const latestStage = Array.isArray(primary) ? primary.at(-1) : null
  const latestFlow = Array.isArray(secondary) ? secondary.at(-1) : null

  // Flood stage from gauge metadata (fallback to null)
  const floodStageFt = data?.metadata?.floodStage ?? null

  return {
    stageFt: latestStage?.value ?? null,
    flowCfs: latestFlow?.value ?? null,
    floodStageFt,
    fetchedAt: new Date(),
  }
}
