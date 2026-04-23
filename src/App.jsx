import { useState, useEffect, useCallback } from 'react'
import { calculateFlag } from './utils/flagCalculation.js'
import { fetchUSGS } from './services/usgsService.js'
import { fetchNWPS } from './services/nwpsService.js'
import { fetchNWS } from './services/nwsService.js'
import FlagBanner from './components/FlagBanner.jsx'
import DataGauges from './components/DataGauges.jsx'
import WindAdvisory from './components/WindAdvisory.jsx'
import ForecastSection from './components/ForecastSection.jsx'
import SafetyTable from './components/SafetyTable.jsx'

// Refresh every 10 minutes
const REFRESH_INTERVAL_MS = 10 * 60 * 1000

function formatTime(date) {
  if (!date) return '—'
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usgs, setUsgs] = useState(null)
  const [nwps, setNwps] = useState(null)
  const [nws, setNws] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const flag = usgs ? calculateFlag(usgs.velocityFps, usgs.tempF) : null

  const fetchAll = useCallback(async () => {
    setError(null)
    try {
      const [usgsData, nwpsData, nwsData] = await Promise.allSettled([
        fetchUSGS(),
        fetchNWPS(),
        fetchNWS(),
      ])

      if (usgsData.status === 'fulfilled') setUsgs(usgsData.value)
      if (nwpsData.status === 'fulfilled') setNwps(nwpsData.value)
      if (nwsData.status === 'fulfilled') setNws(nwsData.value)

      // If all three fail it's a genuine error
      if (
        usgsData.status === 'rejected' &&
        nwpsData.status === 'rejected' &&
        nwsData.status === 'rejected'
      ) {
        setError('Unable to load river data. Please try again later.')
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error(err)
      setError('Unable to load river data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Auto-refresh
  useEffect(() => {
    const timer = setInterval(fetchAll, REFRESH_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [fetchAll])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
              WRC River Conditions
            </h1>
            <p className="text-xs text-gray-400">Willamette Rowing Club · Sellwood</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {formatTime(lastUpdated)}
              </span>
            )}
            <button
              onClick={fetchAll}
              disabled={loading}
              className="text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 px-3 py-1.5 rounded-lg font-medium text-gray-600 transition-colors"
            >
              {loading ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Flag banner */}
        <FlagBanner flag={flag} loading={loading && !usgs} error={error} />

        {/* Error state — partial data still shown if available */}
        {error && usgs && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            Some data sources are unavailable. Displaying most recent readings.
          </div>
        )}

        {/* River gauges */}
        {(usgs || nwps) && <DataGauges usgs={usgs} nwps={nwps} />}

        {/* Wind advisory */}
        {nws?.current && <WindAdvisory nwsCurrent={nws.current} />}

        {/* Weather forecast */}
        {nws?.periods?.length > 0 && <ForecastSection periods={nws.periods} />}

        {/* Safety reference table */}
        <SafetyTable activeFlag={flag} />

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-4 flex flex-col gap-1">
          <p>
            River data:{' '}
            <a
              href="https://waterdata.usgs.gov/nwis/uv?site_no=14211720"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              USGS station 14211720
            </a>
            {' · '}
            <a
              href="https://water.noaa.gov/gauges/PRTO3"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              NOAA gauge PRTO3
            </a>
          </p>
          <p>
            Weather:{' '}
            <a
              href="https://www.weather.gov/pqr/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              NWS Portland
            </a>
          </p>
          <p className="mt-1 text-gray-300">
            Auto-refreshes every 10 minutes · {new Date().getFullYear()} Willamette Rowing Club
          </p>
        </footer>
      </main>
    </div>
  )
}
