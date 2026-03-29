// Endpoint chamado pelo cron job para manter o Supabase ativo
// Vercel Cron dispara uma vez por dia automaticamente
export default async function handler(req, res) {
  // Só aceita chamada do próprio Vercel Cron (header de autenticação)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads?select=id&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      }
    )

    if (!response.ok) throw new Error(`Supabase retornou ${response.status}`)

    const now = new Date().toISOString()
    console.log(`[PING] Supabase ativo — ${now}`)

    return res.status(200).json({ ok: true, timestamp: now })
  } catch (err) {
    console.error('[PING] Erro:', err.message)
    return res.status(500).json({ ok: false, error: err.message })
  }
}
