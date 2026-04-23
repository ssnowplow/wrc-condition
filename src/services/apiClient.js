import { WORKER_BASE } from '../constants.js'

/**
 * Thin fetch wrapper that routes all upstream API calls through the
 * Cloudflare Worker proxy (WORKER_BASE).  In local dev the proxy is
 * satisfied by Vite's devProxy config; in production WORKER_BASE is
 * set to the deployed Worker URL.
 */
export async function proxyFetch(upstreamUrl, options = {}) {
  // In production the Worker receives the upstream URL as a query param.
  // In dev (WORKER_BASE = '') we rely on Vite's /proxy/* rewrite.
  let url
  if (WORKER_BASE) {
    url = `${WORKER_BASE}?url=${encodeURIComponent(upstreamUrl)}`
  } else {
    // Map well-known domains to dev-proxy paths so Vite can rewrite them.
    url = upstreamUrl
      .replace('https://waterservices.usgs.gov', '/usgs-proxy')
      .replace('https://api.water.noaa.gov', '/nwps-proxy')
      .replace('https://api.weather.gov', '/nws-proxy')
  }

  const res = await fetch(url, { ...options, signal: options.signal ?? AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
  return res.json()
}
