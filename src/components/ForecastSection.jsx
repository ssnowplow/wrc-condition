function PeriodCard({ period }) {
  if (!period) return null
  const { name, temp, tempUnit, windSpeed, shortForecast, icon, isDaytime } = period
  return (
    <div className={`flex flex-col items-center gap-1 px-3 py-4 rounded-xl border text-center min-w-[100px] ${isDaytime ? 'bg-sky-50 border-sky-200' : 'bg-indigo-50 border-indigo-200'}`}>
      <span className="text-xs font-semibold text-gray-600">{name}</span>
      {icon && (
        <img
          src={icon}
          alt={shortForecast}
          className="w-12 h-12 object-contain"
          loading="lazy"
        />
      )}
      <span className="text-2xl font-bold text-gray-800">
        {temp}°{tempUnit}
      </span>
      <span className="text-xs text-gray-500 leading-snug">{shortForecast}</span>
      {windSpeed && <span className="text-xs text-gray-400 mt-1">💨 {windSpeed}</span>}
    </div>
  )
}

export default function ForecastSection({ periods }) {
  if (!periods?.length) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
        7-Day Forecast
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {periods.map((p, i) => (
          <PeriodCard key={i} period={p} />
        ))}
      </div>
    </section>
  )
}
