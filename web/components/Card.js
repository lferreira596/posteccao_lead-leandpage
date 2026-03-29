import { useState } from 'react'
import { STATUS_CONFIG } from '../lib/messages'
import CardModal from './CardModal'

export default function Card({ lead, onUpdate, isDragging }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[lead.status]

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={`bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer border-l-4 transition-shadow select-none
          ${isDragging ? 'shadow-xl rotate-1 opacity-90' : 'hover:shadow-md'}
        `}
        style={{ borderLeftColor: cfg?.dot?.replace('bg-', '') }}
      >
        {/* Nome */}
        <p className="font-semibold text-sm text-gray-800 leading-tight mb-1">{lead.name}</p>

        {/* Rating + reviews */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span>⭐ {lead.rating}</span>
          <span>·</span>
          <span>💬 {Number(lead.reviews).toLocaleString('pt-BR')}</span>
          <span className="ml-auto text-yellow-500 text-xs tracking-tighter">{'★'.repeat(Math.min(lead.score || 0, 6))}</span>
        </div>

        {/* Telefone */}
        <p className="text-xs text-gray-500">{lead.phone}</p>

        {/* Instagram / Email se preenchidos */}
        {lead.instagram && (
          <p className="text-xs text-purple-600 mt-1 truncate">📸 {lead.instagram}</p>
        )}
        {lead.email && (
          <p className="text-xs text-blue-600 mt-0.5 truncate">✉️ {lead.email}</p>
        )}

        {/* Observação */}
        {lead.observacao && (
          <p className="text-xs text-gray-400 mt-1 truncate italic">{lead.observacao}</p>
        )}
      </div>

      {open && (
        <CardModal
          lead={lead}
          onUpdate={onUpdate}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
