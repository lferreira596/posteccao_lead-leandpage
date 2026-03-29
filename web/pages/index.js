import { useState } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'
import Header from '../components/Header'

const Board = dynamic(() => import('../components/Board'), { ssr: false })

export default function Home({ leads: initialLeads, config: initialConfig }) {
  const [config, setConfig] = useState(initialConfig)

  return (
    <>
      <Head>
        <title>Pipeline Leadpage</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <Header
          leads={initialLeads}
          config={config}
          onConfigSave={setConfig}
        />
        <Board initialLeads={initialLeads} />
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [{ data: leads }, { data: configRows }] = await Promise.all([
    supabase.from('leads').select('*').order('score', { ascending: false }),
    supabase.from('search_config').select('*').eq('id', 1).limit(1),
  ])

  return {
    props: {
      leads:  leads       || [],
      config: configRows?.[0] || null,
    }
  }
}
