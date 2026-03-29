import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ConfigModal({ config, onClose, onSave }) {
  const [form, setForm] = useState({
    category:      config?.category      || 'restaurantes',
    city:          config?.city          || 'Belo Horizonte',
    state:         config?.state         || 'MG',
    country:       config?.country       || 'BR',
    min_rating:    config?.min_rating    ?? 4.0,
    min_reviews:   config?.min_reviews   ?? 100,
    limit_results: config?.limit_results ?? 100,
  })
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [extraindo, setExtraindo] = useState(false)
  const [resultado, setResultado] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleExtrair = async () => {
    setExtraindo(true)
    setResultado(null)
    try {
      const resp = await fetch('/api/extrair', { method: 'POST' })
      const data = await resp.json()
      setResultado(data)
    } catch (e) {
      setResultado({ error: 'Erro ao conectar com a API.' })
    } finally {
      setExtraindo(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('search_config')
      .upsert({ id: 1, ...form })
    setSaving(false)
    if (!error) {
      setSaved(true)
      onSave(form)
      setTimeout(() => { setSaved(false); onClose() }, 800)
    }
  }

  const query = `${form.category}, ${form.city}, ${form.state}, ${form.country}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gray-800">⚙️ Configurações da Busca</h2>
            <p className="text-xs text-gray-400 mt-0.5">Parâmetros usados na API do Outscraper</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        <div className="p-5 space-y-4">

          {/* Localização */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Localização</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoria</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  placeholder="ex: restaurantes"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cidade</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="ex: Belo Horizonte"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">UF</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={e => set('state', e.target.value.toUpperCase())}
                  placeholder="ex: MG"
                  maxLength={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">País</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={e => set('country', e.target.value.toUpperCase())}
                  placeholder="ex: BR"
                  maxLength={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Filtros de Qualificação</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nota mínima ⭐</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={form.min_rating}
                  onChange={e => set('min_rating', parseFloat(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reviews mín. 💬</label>
                <input
                  type="number"
                  min="0"
                  value={form.min_reviews}
                  onChange={e => set('min_reviews', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Limite 📦</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  step="10"
                  value={form.limit_results}
                  onChange={e => set('limit_results', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Preview da query */}
          <div className="bg-gray-50 border rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Query gerada</p>
            <p className="text-sm text-gray-700 font-mono">{query}</p>
            <p className="text-xs text-gray-400 mt-1">
              Só sem site · Com telefone · Status OPERATIONAL · Rating ≥ {form.min_rating} · Reviews ≥ {form.min_reviews}
            </p>
          </div>

          {/* Salvar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {saved ? '✅ Salvo!' : saving ? 'Salvando...' : '💾 Salvar configurações'}
          </button>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-400 mb-2">
              Salve a configuração antes de extrair. A extração usa os parâmetros acima para buscar novos leads no Google Maps.
            </p>
            <button
              onClick={handleExtrair}
              disabled={extraindo}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {extraindo
                ? <><span className="animate-spin">⏳</span> Buscando leads...</>
                : '🔍 Iniciar Extração de Dados'}
            </button>

            {resultado && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${resultado.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>
                {resultado.error
                  ? `❌ ${resultado.error}`
                  : <>
                      <p className="font-semibold">{resultado.mensagem}</p>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span>🆕 Novos: <strong>{resultado.novos}</strong></span>
                        <span>♻️ Já existiam: <strong>{resultado.existentes}</strong></span>
                        <span>📦 Total encontrados: <strong>{resultado.total}</strong></span>
                      </div>
                      {resultado.novos > 0 && (
                        <p className="text-xs mt-1 text-green-600">Recarregue a página para ver os novos leads no Kanban.</p>
                      )}
                    </>
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
