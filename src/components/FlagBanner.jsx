import { FLAG_CONFIG } from '../constants.js'

export default function FlagBanner({ flag, loading, error }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-2xl animate-pulse">
        <span className="text-gray-400 text-lg font-medium">Loading conditions…</span>
      </div>
    )
  }

  if (error || !flag) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-200 rounded-2xl gap-2">
        <span className="text-4xl">⚠️</span>
        <span className="text-gray-600 font-medium">River data unavailable</span>
        <span className="text-gray-400 text-sm">Check back shortly</span>
      </div>
    )
  }

  const cfg = FLAG_CONFIG[flag]

  return (
    <div className={`rounded-2xl px-8 py-10 flex flex-col items-center gap-3 ${cfg.bg} ${cfg.text} border-4 ${cfg.border} shadow-lg`}>
      {/* Color swatch strip */}
      <div className="flex gap-2 mb-1">
        {Object.entries(FLAG_CONFIG).map(([key, c]) => (
          <div
            key={key}
            className={`h-4 w-8 rounded-full border-2 ${key === flag ? 'border-white scale-125' : 'border-transparent opacity-50'} ${c.bg}`}
          />
        ))}
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center leading-tight">
        {cfg.label}
      </h1>

      <p className="text-center text-sm md:text-base opacity-90 max-w-md">
        {cfg.requirements}
      </p>
    </div>
  )
}
