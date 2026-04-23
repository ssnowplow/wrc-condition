import { FLAG_CONFIG } from '../constants.js'

const FLAG_ORDER = ['GREEN', 'YELLOW', 'ORANGE', 'RED', 'BLACK']

const FLAG_ICON = {
  GREEN: '🟢',
  YELLOW: '🟡',
  ORANGE: '🟠',
  RED: '🔴',
  BLACK: '⚫',
}

export default function SafetyTable({ activeFlag }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Flag Conditions Reference
      </h2>
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-2 font-semibold">Flag</th>
              <th className="text-left px-4 py-2 font-semibold">Status</th>
              <th className="text-left px-4 py-2 font-semibold">Requirements</th>
            </tr>
          </thead>
          <tbody>
            {FLAG_ORDER.map((key) => {
              const cfg = FLAG_CONFIG[key]
              const isActive = key === activeFlag
              return (
                <tr
                  key={key}
                  className={`border-t border-gray-100 transition-colors ${isActive ? 'ring-2 ring-inset ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                      {FLAG_ICON[key]} {key}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">{cfg.label}</td>
                  <td className="px-4 py-3 text-gray-600">{cfg.requirements}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
