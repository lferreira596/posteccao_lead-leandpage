import { STATUS_CONFIG, STATUS_ORDER } from '../lib/messages'

export default function Header({ leads }) {
  const counts = {}
  STATUS_ORDER.forEach(s => counts[s] = 0)
  leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1 })

  const contactados = leads.length - counts.novo
  const taxa = contactados > 0 ? ((counts.fechado / contactados) * 100).toFixed(1) : '0.0'

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍽️</span>
          <span className="font-bold text-gray-800 text-lg">Pipeline Leadpage</span>
          <span className="text-gray-400 text-sm ml-1">BH</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_ORDER.map(s => (
            <div key={s} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].border}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
              <span className="text-gray-600">{STATUS_CONFIG[s].label}</span>
              <span className="font-bold text-gray-800">{counts[s]}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 border-gray-200">
            <span>📈</span>
            <span className="text-gray-600">Conversão</span>
            <span className="font-bold text-gray-800">{taxa}%</span>
          </div>
        </div>
      </div>
    </header>
  )
}
