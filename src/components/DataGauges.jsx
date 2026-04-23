function Gauge({ label, value, unit, sub, warn }) {
  return (
    <div className={`flex flex-col items-center gap-1 px-4 py-5 rounded-xl border ${warn ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'} shadow-sm min-w-[110px]`}>
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold ${warn ? 'text-amber-700' : 'text-gray-800'}`}>
        {value ?? '—'}
      </span>
      {unit && <span className="text-xs text-gray-400">{unit}</span>}
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

export default function DataGauges({ usgs, nwps }) {
  const { velocityFps, tempF, tempC } = usgs ?? {}
  const { stageFt, flowCfs } = nwps ?? {}

  const tempWarn = tempF != null && tempF < 50

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Current River Readings
      </h2>
      <div className="flex flex-wrap gap-3">
        <Gauge
          label="Velocity"
          value={velocityFps != null ? velocityFps.toFixed(2) : null}
          unit="fps"
          warn={velocityFps != null && velocityFps >= 1.5}
        />
        <Gauge
          label="Water Temp"
          value={tempF != null ? Math.round(tempF) : null}
          unit="°F"
          sub={tempC != null ? `${tempC.toFixed(1)} °C` : null}
          warn={tempWarn}
        />
        <Gauge
          label="Stage"
          value={stageFt != null ? stageFt.toFixed(1) : null}
          unit="ft"
        />
        <Gauge
          label="Flow"
          value={flowCfs != null ? Math.round(flowCfs).toLocaleString() : null}
          unit="cfs"
        />
      </div>
    </section>
  )
}
