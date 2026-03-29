import { useState } from 'react'
import { STATUS_CONFIG } from '../lib/messages'
import CardModal from './CardModal'

const PRICE_COLOR = { '$': 'text-green-600', '$$': 'text-yellow-600', '$$$': 'text-orange-500', '$$$$': 'text-red-500' }

export default function Card({ lead, onUpdate, isDragging }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[lead.status]

  const dotColor = {
    'bg-blue-500':   '#3b82f6', 'bg-yellow-500': '#eab308',
    'bg-orange-500': '#f97316', 'bg-purple-500': '#a855f7',
    'bg-green-500':  '#22c55e', 'bg-red-500':    '#ef4444',
  }[cfg?.dot] || '#94a3b8'

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={`bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer border-l-4 transition-shadow select-none
          ${isDragging ? 'shadow-xl rotate-1 opacity-90' : 'hover:shadow-md'}`}
        style={{ borderLeftColor: dotColor }}
      >
        {/* Nome + verificado */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <p className="font-semibold text-sm text-gray-800 leading-tight">{lead.name}</p>
          {lead.verified && <span className="text-blue-500 text-xs shrink-0" title="Verificado no Google">✓</span>}
        </div>

        {/* Rating + reviews + preço */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
          <span>⭐ {lead.rating}</span>
          <span>·</span>
          <span>💬 {Number(lead.reviews).toLocaleString('pt-BR')}</span>
          {lead.price_range && (
            <span className={`ml-auto font-bold ${PRICE_COLOR[lead.price_range] || 'text-gray-500'}`}>
              {lead.price_range}
            </span>
          )}
        </div>

        {/* Endereço */}
        {lead.street && (
          <p className="text-xs text-gray-500 truncate mb-1">📍 {lead.street}</p>
        )}

        {/* Fotos */}
        {lead.photos_count > 0 && (
          <p className="text-xs text-gray-400 mb-1">🖼️ {lead.photos_count} fotos</p>
        )}

        {/* Descrição (truncada) */}
        {lead.description && (
          <p className="text-xs text-gray-400 italic truncate mb-1">{lead.description}</p>
        )}

        {/* Instagram / Email */}
        {lead.instagram && (
          <p className="text-xs text-purple-600 truncate">📸 {lead.instagram}</p>
        )}
        {lead.email && (
          <p className="text-xs text-blue-600 truncate">✉️ {lead.email}</p>
        )}

        {/* Score */}
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-gray-400 truncate">{lead.phone}</p>
          <span className="text-yellow-400 text-xs tracking-tighter">{'★'.repeat(Math.min(lead.score || 0, 6))}</span>
        </div>
      </div>

      {open && <CardModal lead={lead} onUpdate={onUpdate} onClose={() => setOpen(false)} />}
    </>
  )
}
