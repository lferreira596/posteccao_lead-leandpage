import dynamic from 'next/dynamic'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'
import Header from '../components/Header'

// DnD não funciona com SSR — importar apenas no cliente
const Board = dynamic(() => import('../components/Board'), { ssr: false })

export default function Home({ leads }) {
  return (
    <>
      <Head>
        <title>Pipeline Leadpage — BH</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <Header leads={leads} />
        <Board initialLeads={leads} />
      </div>
    </>
  )
}

export async function getServerSideProps() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('score', { ascending: false })

  return { props: { leads: leads || [] } }
}
