import { createClient } from '@supabase/supabase-js'

// Aumenta timeout da função serverless (necessário para chamadas longas)
export const config = { maxDuration: 60 }

function calcScore(r) {
  let score = 0
  const rating  = parseFloat(r.rating  || 0)
  const reviews = parseInt(r.reviews   || 0)
  score += rating  >= 4.5 ? 3 : rating  >= 4.0 ? 2 : 1
  score += reviews >= 500 ? 3 : reviews >= 200  ? 2 : 1
  return score
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // ── 1. Lê config do Supabase ─────────────────────────────────────────────
  const { data: configRows } = await supabase
    .from('search_config')
    .select('*')
    .eq('id', 1)
    .limit(1)

  const cfg = configRows?.[0] || {
    category: 'restaurantes', city: 'Belo Horizonte',
    state: 'MG', country: 'BR',
    min_rating: 4.0, min_reviews: 100, limit_results: 100,
  }

  const query = `${cfg.category}, ${cfg.city}, ${cfg.state}, ${cfg.country}`

  // ── 2. Chama Outscraper REST API ─────────────────────────────────────────
  const outscraper = await fetch(
    `https://api.app.outscraper.com/maps/search?query=${encodeURIComponent(query)}&limit=${cfg.limit_results}&language=pt&async=false`,
    { headers: { 'X-API-KEY': process.env.OUTSCRAPER_API_KEY } }
  )

  if (!outscraper.ok) {
    const detail = await outscraper.text()
    return res.status(500).json({ error: 'Outscraper API falhou', detail })
  }

  const outData = await outscraper.json()

  // Achata lista de listas
  const registros = (outData.data || []).flat()

  // ── 3. Filtros locais ────────────────────────────────────────────────────
  const filtrados = registros.filter(r =>
    (r.reviews || 0)           >= Number(cfg.min_reviews) &&
    parseFloat(r.rating || 0)  >= parseFloat(cfg.min_rating) &&
    !r.website &&
    r.phone &&
    r.business_status === 'OPERATIONAL'
  )

  if (filtrados.length === 0) {
    return res.json({ novos: 0, existentes: 0, total: 0, mensagem: 'Nenhum lead encontrado com esses critérios.' })
  }

  // ── 4. Deduplica por place_id contra leads já existentes ─────────────────
  const placeIds = filtrados.map(r => r.place_id).filter(Boolean)

  const { data: jaExistem } = await supabase
    .from('leads')
    .select('place_id')
    .in('place_id', placeIds)

  const idsExistentes = new Set((jaExistem || []).map(r => r.place_id))

  const novosLeads = filtrados.filter(r => r.place_id && !idsExistentes.has(r.place_id))

  if (novosLeads.length === 0) {
    return res.json({ novos: 0, existentes: filtrados.length, total: filtrados.length, mensagem: 'Todos os leads já estão no pipeline.' })
  }

  // ── 5. Gera IDs sequenciais ──────────────────────────────────────────────
  const { data: maxRow } = await supabase
    .from('leads')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)

  let nextId = (maxRow?.[0]?.id || 0) + 1

  const rows = novosLeads.map((r, i) => ({
    id:           nextId + i,
    name:         r.name,
    phone:        r.phone         || null,
    category:     r.type          || cfg.category,
    rating:       r.rating        || null,
    reviews:      r.reviews       || null,
    city:         r.city          || cfg.city,
    location_link: r.location_link || null,
    score:        calcScore(r),
    status:       'novo',
    place_id:     r.place_id      || null,
    data_contato: null,
    observacao:   null,
    instagram:    null,
    email:        null,
  }))

  // ── 6. Insere no Supabase ────────────────────────────────────────────────
  const { error } = await supabase.from('leads').insert(rows)

  if (error) return res.status(500).json({ error: error.message })

  return res.json({
    novos:      rows.length,
    existentes: filtrados.length - rows.length,
    total:      filtrados.length,
    mensagem:   `${rows.length} novos leads adicionados ao pipeline!`,
  })
}
