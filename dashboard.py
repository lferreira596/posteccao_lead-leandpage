import csv
import re
import urllib.parse
from datetime import date

import streamlit as st

PIPELINE_FILE = 'pipeline.csv'
STATUS_ORDEM = ['novo', 'contato_feito', 'interessado', 'proposta_enviada', 'fechado', 'perdido']
STATUS_COR = {
    'novo': '🔵',
    'contato_feito': '🟡',
    'interessado': '🟠',
    'proposta_enviada': '🟣',
    'fechado': '🟢',
    'perdido': '🔴',
}
PIPELINE_CAMPOS = [
    'id', 'name', 'phone', 'category', 'rating', 'reviews',
    'city', 'location_link', 'score', 'status', 'data_contato', 'observacao'
]


# ── I/O ─────────────────────────────────────────────────────────────────────

def carregar():
    with open(PIPELINE_FILE, encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def salvar(rows):
    with open(PIPELINE_FILE, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=PIPELINE_CAMPOS)
        writer.writeheader()
        writer.writerows(rows)


# ── WhatsApp ─────────────────────────────────────────────────────────────────

def link_whatsapp(telefone, mensagem):
    numero = re.sub(r'\D', '', telefone)
    if not numero.startswith('55'):
        numero = '55' + numero
    return f"https://wa.me/{numero}?text={urllib.parse.quote(mensagem)}"


def gerar_mensagem(lead):
    nome, reviews, status = lead['name'], lead['reviews'], lead['status']
    if status == 'novo':
        return (f"Oi, tudo bem? Vi que o {nome} tem {reviews} avaliações no Google — parabéns, é um número incrível!\n\n"
                f"Trabalho criando páginas de captação para restaurantes. Muitos clientes te pesquisam no Google mas não encontram "
                f"um lugar para reservar mesa, ver o cardápio ou entrar em contato direto.\n\n"
                f"Posso te mostrar um exemplo de como ficaria para o {nome}? É rápido, sem compromisso.")
    elif status == 'contato_feito':
        return (f"Oi! Passei aqui para saber se você teve chance de ver minha mensagem sobre o {nome}.\n\n"
                f"Tenho um exemplo pronto que posso te mostrar agora mesmo. Só preciso de 2 minutos do seu tempo.")
    elif status == 'interessado':
        return (f"Que ótimo! Vou te enviar o exemplo da página do {nome} agora.\n\n"
                f"A ideia é simples: uma página com o cardápio, botão de reserva direto no WhatsApp, fotos e localização. "
                f"Tudo que o cliente precisa para escolher você na hora.\n\n"
                f"Qual o melhor horário para conversarmos 15 minutos?")
    elif status == 'proposta_enviada':
        return (f"Segue a proposta para o {nome}:\n\n"
                f"✅ Página personalizada com identidade do restaurante\n"
                f"✅ Cardápio digital integrado\n"
                f"✅ Botão de reserva via WhatsApp\n"
                f"✅ Galeria de fotos\n"
                f"✅ Localização e horário de funcionamento\n"
                f"✅ Otimizada para aparecer no Google\n\n"
                f"Vocês já têm {reviews} avaliações — isso é prova social poderosa. "
                f"A página vai converter essa visibilidade em clientes prontos para comprar.\n\n"
                f"Posso ter tudo pronto em até 5 dias úteis. Quando podemos fechar?")
    return ''


# ── App ──────────────────────────────────────────────────────────────────────

st.set_page_config(page_title='Pipeline Leadpage', page_icon='🍽️', layout='wide')
st.title('🍽️ Pipeline de Vendas — Leadpage para Restaurantes')

rows = carregar()

# ── Métricas ─────────────────────────────────────────────────────────────────

por_status = {s: 0 for s in STATUS_ORDEM}
for r in rows:
    por_status[r['status']] = por_status.get(r['status'], 0) + 1

contactados = len(rows) - por_status['novo']
taxa = round(por_status['fechado'] / contactados * 100, 1) if contactados > 0 else 0.0

c1, c2, c3, c4, c5, c6 = st.columns(6)
c1.metric('🔵 Novos', por_status['novo'])
c2.metric('🟡 Contato feito', por_status['contato_feito'])
c3.metric('🟠 Interessados', por_status['interessado'])
c4.metric('🟣 Proposta enviada', por_status['proposta_enviada'])
c5.metric('🟢 Fechados', por_status['fechado'])
c6.metric('📈 Conversão', f'{taxa}%')

st.divider()

# ── Tabs ──────────────────────────────────────────────────────────────────────

tab1, tab2, tab3 = st.tabs(['📋 Pipeline', '📨 Abordagem WhatsApp', '📊 Insights'])

# ── Tab 1: Pipeline ───────────────────────────────────────────────────────────

with tab1:
    col_f1, col_f2 = st.columns([2, 1])
    with col_f1:
        filtro_status = st.multiselect(
            'Filtrar por status',
            STATUS_ORDEM,
            default=STATUS_ORDEM,
            format_func=lambda s: f"{STATUS_COR[s]} {s}"
        )
    with col_f2:
        filtro_busca = st.text_input('Buscar por nome', placeholder='Ex: Paladino')

    filtrados = [
        r for r in rows
        if r['status'] in filtro_status
        and filtro_busca.lower() in r['name'].lower()
    ]

    st.caption(f'{len(filtrados)} leads exibidos')

    for lead in filtrados:
        with st.expander(f"{STATUS_COR[lead['status']]}  **{lead['name']}** — ⭐ {lead['rating']} ({lead['reviews']} reviews)"):
            col_a, col_b = st.columns([3, 1])
            with col_a:
                st.write(f"📞 {lead['phone']}")
                st.write(f"🏙️ {lead['city']} | {lead['category']}")
                st.markdown(f"[📍 Ver no Google Maps]({lead['location_link']})")
                if lead['observacao']:
                    st.info(f"📝 {lead['observacao']}")
            with col_b:
                novo_status = st.selectbox(
                    'Status',
                    STATUS_ORDEM,
                    index=STATUS_ORDEM.index(lead['status']),
                    key=f"status_{lead['id']}"
                )
                nova_obs = st.text_input('Observação', value=lead['observacao'], key=f"obs_{lead['id']}")
                if st.button('Salvar', key=f"save_{lead['id']}"):
                    for row in rows:
                        if row['id'] == lead['id']:
                            row['status'] = novo_status
                            row['observacao'] = nova_obs
                            row['data_contato'] = str(date.today())
                    salvar(rows)
                    st.success('Salvo!')
                    st.rerun()

# ── Tab 2: WhatsApp ───────────────────────────────────────────────────────────

with tab2:
    st.subheader('Próximas abordagens')

    acoes_status = ['novo', 'contato_feito', 'interessado', 'proposta_enviada']
    leads_acao = [r for r in rows if r['status'] in acoes_status]

    if not leads_acao:
        st.info('Nenhum lead pendente de abordagem.')
    else:
        lead_nomes = {r['id']: f"[ID {r['id']}] {r['name']} ({r['status']})" for r in leads_acao}
        escolha = st.selectbox('Selecionar lead', list(lead_nomes.keys()), format_func=lambda i: lead_nomes[i])

        lead_sel = next(r for r in rows if r['id'] == escolha)
        mensagem = gerar_mensagem(lead_sel)

        st.text_area('Mensagem gerada', value=mensagem, height=220)
        link = link_whatsapp(lead_sel['phone'], mensagem)
        st.markdown(f"[💬 Abrir no WhatsApp]({link})", unsafe_allow_html=False)

        st.divider()
        st.caption('Após enviar, atualize o status do lead na aba Pipeline.')

# ── Tab 3: Insights ───────────────────────────────────────────────────────────

with tab3:
    st.subheader('Distribuição do funil')

    import pandas as pd

    df_funil = pd.DataFrame({
        'Status': list(por_status.keys()),
        'Leads': list(por_status.values())
    })
    st.bar_chart(df_funil.set_index('Status'))

    st.divider()
    st.subheader('Top leads por score')

    top = sorted(rows, key=lambda x: int(x['score']), reverse=True)[:10]
    df_top = pd.DataFrame([{
        'Nome': r['name'],
        'Score': int(r['score']),
        'Rating': float(r['rating']),
        'Reviews': int(r['reviews']),
        'Status': r['status'],
    } for r in top])
    st.dataframe(df_top, use_container_width=True)
