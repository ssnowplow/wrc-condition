/**
 * WRC Conditions Proxy — Cloudflare Worker
 *
 * Routes: GET /?url=<encoded-upstream-url>
 *
 * - Validates the upstream URL is one of the three allowed APIs.
 * - Adds CORS headers so the browser app can fetch directly.
 * - Caches responses at the edge for 5 minutes (free-tier safe via Cache API).
 */

const ALLOWED_ORIGINS_DEFAULT = [
  'https://wrc-conditions.pages.dev',
  'http://localhost:5173',
]

// Only these upstream hosts are allowed through the proxy
const ALLOWED_UPSTREAMS = [
  'waterservices.usgs.gov',
  'api.water.noaa.gov',
  'api.weather.gov',
]

const CACHE_TTL = 300 // seconds (5 min)

function corsHeaders(origin, allowedOrigins) {
  const allow = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

export default {
  async fetch(request, env) {
    const allowedOrigins = env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
      : ALLOWED_ORIGINS_DEFAULT

    const origin = request.headers.get('Origin') ?? ''
    const cors = corsHeaders(origin, allowedOrigins)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: cors })
    }

    const { searchParams } = new URL(request.url)
    const rawUrl = searchParams.get('url')
    if (!rawUrl) {
      return new Response('Missing ?url= parameter', { status: 400, headers: cors })
    }

    let upstreamUrl
    try {
      upstreamUrl = new URL(rawUrl)
    } catch {
      return new Response('Invalid upstream URL', { status: 400, headers: cors })
    }

    if (!ALLOWED_UPSTREAMS.includes(upstreamUrl.hostname)) {
      return new Response(`Upstream not allowed: ${upstreamUrl.hostname}`, {
        status: 403,
        headers: cors,
      })
    }

    // Check edge cache first
    const cache = caches.default
    const cacheKey = new Request(upstreamUrl.toString())
    const cached = await cache.match(cacheKey)
    if (cached) {
      const resp = new Response(cached.body, cached)
      Object.entries(cors).forEach(([k, v]) => resp.headers.set(k, v))
      resp.headers.set('X-Cache', 'HIT')
      return resp
    }

    // Fetch from upstream
    let upstream
    try {
      upstream = await fetch(upstreamUrl.toString(), {
        headers: {
          'User-Agent': 'WRC-Conditions-Proxy/1.0 (contact: conditions@willametterowing.org)',
          Accept: 'application/json',
        },
      })
    } catch (err) {
      return new Response(`Upstream fetch failed: ${err.message}`, {
        status: 502,
        headers: cors,
      })
    }

    if (!upstream.ok) {
      return new Response(`Upstream returned ${upstream.status}`, {
        status: upstream.status,
        headers: cors,
      })
    }

    const body = await upstream.text()

    // Build cacheable response
    const toCache = new Response(body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    })
    await cache.put(cacheKey, toCache.clone())

    // Return to browser with CORS
    const response = new Response(body, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
        'X-Cache': 'MISS',
      },
    })
    return response
  },
}
