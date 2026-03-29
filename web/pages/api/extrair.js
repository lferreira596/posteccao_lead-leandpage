import { createClient } from '@supabase/supabase-js'

export const config = { maxDuration: 120 }

const OUTSCRAPER_URLS = [
  'https://api.app.outscraper.com',
  'https://api.app.outscraper.cloud',
]

function calcScore(r) {
  const rating  = parseFloat(r.rating  || 0)
  const reviews = parseInt(r.reviews   || 0)
  let score = 0
  score += rating  >= 4.5 ? 3 : rating  >= 4.0 ? 2 : 1
  score += reviews >= 500 ? 3 : reviews >= 200  ? 2 : 1
  return score
}

async function outscrapePost(path, body) {
  for (const base of OUTSCRAPER_URLS) {
    try {
      const r = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.OUTSCRAPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (r.ok) return r.json()
    } catch (_) {}
  }
  throw new Error('Todos os endpoints do Outscraper falharam')
}

async function outscrapeGet(path) {
  for (const base of OUTSCRAPER_URLS) {
    try {
      const r = await fetch(`${base}${path}`, {
        headers: { 'X-API-KEY': process.env.OUTSCRAPER_API_KEY },
      })
      if (r.ok) return r.json()
    } catch (_) {}
  }
  throw new Error('Falha ao buscar resultado')
}

// Aguarda resultado assíncrono com polling (até 100 segundos)
async function aguardarResultado(requestId) {
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const poll = await outscrapeGet(`/requests/${requestId}`)
    if (poll.status === 'Success') return poll.data || []
    if (poll.status === 'Failed')  throw new Error(`Outscraper falhou: ${poll.error || ''}`)
  }
  throw new Error('Timeout aguardando Outscraper (100s)')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // ── 1. Config ─────────────────────────────────────────────────────────────
  const { data: configRows } = await supabase
    .from('search_config').select('*').eq('id', 1).limit(1)

  const cfg = configRows?.[0] || {
    category: 'restaurants', city: 'Belo Horizonte',
    state: 'Minas Gerais', country: 'Brazil',
    min_rating: 4.0, min_reviews: 100, limit_results: 100,
  }

  const query = `${cfg.category}, ${cfg.city}, ${cfg.state}, ${cfg.country}`
  console.log('[extrair] query:', query, '| limite:', cfg.limit_results)

  // ── 2. Outscraper ─────────────────────────────────────────────────────────
  let outData
  try {
    outData = await outscrapePost('/google-maps-search', {
      query:                      [query],
      language:                   'pt',
      organizationsPerQueryLimit: Number(cfg.limit_results),
      dropDuplicates:             true,
      async:                      false,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }

  console.log('[extrair] status Outscraper:', outData.status, '| id:', outData.id)

  // ── 3. Polling se assíncrono ──────────────────────────────────────────────
  let registros = []
  try {
    if (outData.status === 'Success') {
      registros = (outData.data || []).flat()
    } else if (outData.id) {
      // Resposta assíncrona — faz polling
      const asyncData = await aguardarResultado(outData.id)
      registros = (asyncData || []).flat()
    } else {
      return res.status(500).json({
        error: `Resposta inesperada do Outscraper`,
        detail: JSON.stringify(outData).slice(0, 300),
      })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }

  console.log('[extrair] registros brutos:', registros.length)

  // ── 4. Filtros ────────────────────────────────────────────────────────────
  const filtrados = registros.filter(r =>
    (r.reviews || 0)          >= Number(cfg.min_reviews) &&
    parseFloat(r.rating || 0) >= parseFloat(cfg.min_rating) &&
    !r.website &&
    r.phone &&
    r.business_status === 'OPERATIONAL'
  )

  console.log('[extrair] após filtros:', filtrados.length)

  if (filtrados.length === 0) {
    return res.json({
      novos: 0, existentes: 0, total: registros.length,
      mensagem: `Nenhum lead qualificado. ${registros.length} lugares encontrados mas nenhum passou nos filtros (sem site, com telefone, rating ≥ ${cfg.min_rating}, reviews ≥ ${cfg.min_reviews}).`,
    })
  }

  // ── 5. Deduplica ──────────────────────────────────────────────────────────
  const placeIds = filtrados.map(r => r.place_id).filter(Boolean)
  const { data: jaExistem } = await supabase
    .from('leads').select('place_id').in('place_id', placeIds)

  const idsExistentes = new Set((jaExistem || []).map(r => r.place_id))
  const novosLeads    = filtrados.filter(r => r.place_id && !idsExistentes.has(r.place_id))

  if (novosLeads.length === 0) {
    return res.json({ novos: 0, existentes: filtrados.length, total: filtrados.length, mensagem: 'Todos os leads já estão no pipeline.' })
  }

  // ── 6. Insere ─────────────────────────────────────────────────────────────
  const { data: maxRow } = await supabase
    .from('leads').select('id').order('id', { ascending: false }).limit(1)

  let nextId = (maxRow?.[0]?.id || 0) + 1

  const rows = novosLeads.map((r, i) => ({
    id:            nextId + i,
    name:          r.name,
    phone:         r.phone                          || null,
    category:      r.type                           || cfg.category,
    rating:        r.rating                         || null,
    reviews:       r.reviews                        || null,
    city:          r.city                           || cfg.city,
    location_link: r.location_link                  || null,
    score:         calcScore(r),
    status:        'novo',
    place_id:      r.place_id                       || null,
    address:       r.address                        || null,
    street:        r.street                         || null,
    description:   r.description                    || null,
    subtypes:      Array.isArray(r.subtypes) ? r.subtypes.join(', ') : (r.subtypes || null),
    photos_count:  r.photos_count                   || null,
    price_range:   r.range                          || null,
    verified:      r.verified                       || false,
    working_hours: r.working_hours_csv_compatible   || null,
    owner_title:   r.owner_title                    || null,
    data_contato:  null,
    observacao:    null,
    instagram:     null,
    email:         null,
  }))

  const { error } = await supabase.from('leads').insert(rows)
  if (error) return res.status(500).json({ error: error.message })

  return res.json({
    novos:      rows.length,
    existentes: filtrados.length - rows.length,
    total:      filtrados.length,
    mensagem:   `${rows.length} novos leads adicionados ao pipeline!`,
  })
}
