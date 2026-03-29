import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ESTADOS = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' },
]

const CATEGORIAS = [
  { label: 'Restaurantes',        api: 'restaurants' },
  { label: 'Bares',               api: 'bars' },
  { label: 'Cafés / Cafeterias',  api: 'cafes' },
  { label: 'Pizzarias',           api: 'pizza restaurants' },
  { label: 'Padarias',            api: 'bakeries' },
  { label: 'Hamburguerias',       api: 'hamburger restaurants' },
  { label: 'Churrascarias',       api: 'churrascaria restaurants' },
  { label: 'Japonês / Sushi',     api: 'japanese restaurants' },
  { label: 'Salões de Beleza',    api: 'beauty salons' },
  { label: 'Barbearias',          api: 'barber shops' },
  { label: 'Academias',           api: 'gyms' },
  { label: 'Clínicas',            api: 'clinics' },
  { label: 'Dentistas',           api: 'dentists' },
  { label: 'Hotéis / Pousadas',   api: 'hotels' },
  { label: 'Lojas de Roupas',     api: 'clothing stores' },
  { label: 'Pet Shops',           api: 'pet shops' },
]

export default function ConfigModal({ config, onClose, onSave }) {
  // Encontra o estado salvo pelo nome completo (ex: "Minas Gerais") ou pela UF (legado)
  const estadoInicial = ESTADOS.find(
    e => e.nome === config?.state || e.uf === config?.state
  ) || ESTADOS.find(e => e.uf === 'MG')

  // Encontra a categoria salva pelo valor da API (ex: "restaurants") ou label (legado)
  const catInicial = CATEGORIAS.find(
    c => c.api === config?.category || c.label.toLowerCase() === config?.category?.toLowerCase()
  ) || CATEGORIAS[0]

  const [estado,     setEstado]     = useState(estadoInicial)
  const [categoria,  setCategoria]  = useState(catInicial)
  const [city,       setCity]       = useState(config?.city          || 'Belo Horizonte')
  const [minRating,  setMinRating]  = useState(config?.min_rating    ?? 4.0)
  const [minReviews, setMinReviews] = useState(config?.min_reviews   ?? 100)
  const [limit,      setLimit]      = useState(config?.limit_results ?? 100)

  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [extraindo, setExtraindo] = useState(false)
  const [resultado, setResultado] = useState(null)

  const query = `${categoria.api}, ${city}, ${estado.nome}, Brazil`

  const buildForm = () => ({
    category:      categoria.api,
    city,
    state:         estado.nome,
    country:       'Brazil',
    min_rating:    minRating,
    min_reviews:   minReviews,
    limit_results: limit,
  })

  const handleSave = async () => {
    setSaving(true)
    const form = buildForm()
    const { error } = await supabase.from('search_config').upsert({ id: 1, ...form })
    setSaving(false)
    if (!error) {
      setSaved(true)
      onSave(form)
      setTimeout(() => setSaved(false), 1500)
    }
  }

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[92vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gray-800">⚙️ Configurações da Busca</h2>
            <p className="text-xs text-gray-400 mt-0.5">Parâmetros enviados à API do Outscraper</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        <div className="p-5 space-y-4">

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Tipo de negócio</label>
            <select
              value={categoria.api}
              onChange={e => setCategoria(CATEGORIAS.find(c => c.api === e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {CATEGORIAS.map(c => (
                <option key={c.api} value={c.api}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Localização */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="ex: Belo Horizonte"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Estado</label>
              <select
                value={estado.uf}
                onChange={e => setEstado(ESTADOS.find(s => s.uf === e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {ESTADOS.map(s => (
                  <option key={s.uf} value={s.uf}>{s.uf} — {s.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Filtros de qualificação</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nota mín. ⭐</label>
                <input type="number" step="0.1" min="1" max="5"
                  value={minRating}
                  onChange={e => setMinRating(parseFloat(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reviews mín. 💬</label>
                <input type="number" min="0"
                  value={minReviews}
                  onChange={e => setMinReviews(parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Limite 📦</label>
                <input type="number" min="10" max="500" step="10"
                  value={limit}
                  onChange={e => setLimit(parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Preview da query */}
          <div className="bg-gray-50 border rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Query gerada para a API</p>
            <p className="text-sm text-gray-700 font-mono">{query}</p>
            <p className="text-xs text-gray-400 mt-1">
              Sem site · Com telefone · OPERATIONAL · Rating ≥ {minRating} · Reviews ≥ {minReviews}
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

          {/* Extração */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-400 mb-2">
              Salve antes de extrair. A extração busca novos leads no Google Maps com os parâmetros acima.
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
                  ? `❌ ${resultado.error} ${resultado.detail || ''}`
                  : <>
                      <p className="font-semibold">{resultado.mensagem}</p>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span>🆕 Novos: <strong>{resultado.novos}</strong></span>
                        <span>♻️ Já existiam: <strong>{resultado.existentes}</strong></span>
                        <span>📦 Total: <strong>{resultado.total}</strong></span>
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
