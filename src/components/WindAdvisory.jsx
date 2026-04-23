import { getWindStatus } from '../utils/flagCalculation.js'

const LEVEL_STYLES = {
  calm:    'bg-green-50  border-green-200 text-green-800',
  breezy:  'bg-amber-50  border-amber-300 text-amber-800',
  windy:   'bg-orange-50 border-orange-300 text-orange-800',
  high:    'bg-red-50    border-red-300   text-red-800',
  unknown: 'bg-gray-50   border-gray-200  text-gray-500',
}

const LEVEL_ICON = {
  calm: '🌤',
  breezy: '🍃',
  windy: '💨',
  high: '🌬',
  unknown: '—',
}

export default function WindAdvisory({ nwsCurrent }) {
  const speedMph = nwsCurrent?.windSpeedMph ?? null
  const dir = nwsCurrent?.windDir ?? ''
  const wind = getWindStatus(speedMph)
  const styles = LEVEL_STYLES[wind.level]

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${styles}`}>
      <span className="text-xl">{LEVEL_ICON[wind.level]}</span>
      <div>
        <span className="font-semibold">Wind:</span>{' '}
        {wind.label}
        {dir && speedMph != null ? ` from ${dir}` : ''}
      </div>
      {wind.advisory && (
        <span className="ml-auto text-xs font-semibold uppercase tracking-wide opacity-70">
          Advisory
        </span>
      )}
    </div>
  )
}
