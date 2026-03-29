import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  STATUS_ORDER, STATUS_CONFIG,
  gerarMensagem, linkWhatsApp, linkInstagramDM, linkBuscarInstagram
} from '../lib/messages'

export default function CardModal({ lead, onUpdate, onClose }) {
  const [form, setForm] = useState({
    status:    lead.status    || 'novo',
    instagram: lead.instagram || '',
    email:     lead.email     || '',
    observacao: lead.observacao || '',
  })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const mensagem = gerarMensagem({ ...lead, ...form })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(lead.id, form)
    setSaving(false)
    onClose()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(mensagem)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Cabeçalho ── */}
        <div className="p-5 border-b flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-lg text-gray-800 leading-tight">{lead.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
              <span>⭐ {lead.rating}</span>
              <span>💬 {Number(lead.reviews).toLocaleString('pt-BR')} avaliações</span>
              <span>🏙️ {lead.city}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold shrink-0">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* ── Status ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {STATUS_ORDER.map(s => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>

          {/* ── Instagram + Email ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Instagram</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="@handle"
                  value={form.instagram}
                  onChange={e => set('instagram', e.target.value)}
                  className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <a
                  href={linkBuscarInstagram(lead.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Buscar no Google"
                  className="shrink-0 border rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
                >🔍</a>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email</label>
              <input
                type="email"
                placeholder="email@..."
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* ── Telefone (readonly) ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Telefone</label>
            <div className="bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-700">{lead.phone}</div>
          </div>

          {/* ── Observações ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Observações</label>
            <textarea
              value={form.observacao}
              onChange={e => set('observacao', e.target.value)}
              rows={3}
              placeholder="Anotações sobre o contato..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          {/* ── Mensagem gerada ── */}
          {mensagem && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-400 uppercase">Mensagem para este estágio</label>
                <button
                  onClick={handleCopy}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {copied ? '✅ Copiado!' : '📋 Copiar'}
                </button>
              </div>
              <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {mensagem}
              </div>
            </div>
          )}

          {/* ── Botões de ação ── */}
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={linkWhatsApp(lead.phone, mensagem)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center text-sm py-2 px-3 rounded-lg transition-colors font-medium"
            >
              📱 WhatsApp
            </a>
            {form.instagram ? (
              <a
                href={linkInstagramDM(form.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white text-center text-sm py-2 px-3 rounded-lg transition-opacity font-medium"
              >
                📸 Instagram DM
              </a>
            ) : (
              <a
                href={linkBuscarInstagram(lead.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-purple-300 to-pink-300 text-white text-center text-sm py-2 px-3 rounded-lg font-medium opacity-80 hover:opacity-100"
              >
                📸 Buscar Instagram
              </a>
            )}
            <a
              href={lead.location_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded-lg transition-colors"
            >
              📍 Maps
            </a>
          </div>

          {/* ── Salvar ── */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {saving ? 'Salvando...' : '💾 Salvar alterações'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
