"""
Canal de vendas via WhatsApp
Gera mensagens personalizadas por etapa do funil
"""
import csv
import re
import urllib.parse

PIPELINE_FILE = 'pipeline.csv'


# ── Templates por etapa ─────────────────────────────────────────────────────

def msg_primeiro_contato(nome, reviews):
    return f"""Oi, tudo bem? Vi que o {nome} tem {reviews} avaliiacoes no Google — parabens, e um numero incrivel!

Trabalho criando paginas de captacao para restaurantes. Muitos clientes te pesquisam no Google mas nao encontram um lugar para reservar mesa, ver o cardapio ou entrar em contato direto.

Posso te mostrar um exemplo de como ficaria para o {nome}? E rapido, sem compromisso."""


def msg_followup(nome):
    return f"""Oi! Passei aqui para saber se voce teve chance de ver minha mensagem sobre o {nome}.

Tenho um exemplo pronto que posso te mostrar agora mesmo. So preciso de 2 minutos do seu tempo."""


def msg_interessado(nome):
    return f"""Que otimo! Vou te enviar o exemplo da pagina do {nome} agora.

A ideia e simples: uma pagina com o cardapio, botao de reserva direto no WhatsApp, fotos e localizacao. Tudo que o cliente precisa para escolher voce na hora.

Qual o melhor horario para conversarmos 15 minutos?"""


def msg_proposta(nome, reviews):
    return f"""Segue a proposta para o {nome}:

*Leadpage completa inclui:*
- Pagina personalizada com identidade do restaurante
- Cardapio digital integrado
- Botao de reserva via WhatsApp
- Galeria de fotos
- Localizacao e horario de funcionamento
- Otimizada para aparecer no Google

Voces ja tem {reviews} avaliiacoes — isso e prova social poderosa. A pagina vai converter essa visibilidade em clientes que chegam prontos para comprar.

Posso ter tudo pronto em ate 5 dias uteis.

Quando podemos fechar?"""


# ── Gerar link WhatsApp ─────────────────────────────────────────────────────

def gerar_link_whatsapp(telefone, mensagem):
    numero = re.sub(r'\D', '', telefone)
    if numero.startswith('0'):
        numero = numero[1:]
    if not numero.startswith('55'):
        numero = '55' + numero
    texto = urllib.parse.quote(mensagem)
    return f'https://wa.me/{numero}?text={texto}'


# ── Carregar pipeline ───────────────────────────────────────────────────────

def carregar_pipeline():
    with open(PIPELINE_FILE, encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


# ── Gerar mensagem por lead e etapa ────────────────────────────────────────

TEMPLATES = {
    'novo':             msg_primeiro_contato,
    'contato_feito':    lambda nome, reviews: msg_followup(nome),
    'interessado':      lambda nome, reviews: msg_interessado(nome),
    'proposta_enviada': msg_proposta,
}


def gerar_abordagem(lead_id=None):
    rows = carregar_pipeline()

    if lead_id:
        rows = [r for r in rows if str(r['id']) == str(lead_id)]
    else:
        # Mostra próximos novos
        rows = [r for r in rows if r['status'] == 'novo'][:5]

    if not rows:
        print('Nenhum lead encontrado.')
        return

    for lead in rows:
        status = lead['status']
        nome = lead['name']
        reviews = lead['reviews']
        telefone = lead['phone']

        if status not in TEMPLATES:
            print(f"[ID {lead['id']}] {nome} — status '{status}' nao tem template de mensagem.")
            continue

        mensagem = TEMPLATES[status](nome, reviews)
        link = gerar_link_whatsapp(telefone, mensagem)

        print(f"\n{'='*50}")
        print(f"[ID {lead['id']}] {nome}")
        print(f"Status   : {status}")
        print(f"Telefone : {telefone}")
        print(f"\n--- MENSAGEM ---")
        print(mensagem)
        print(f"\n--- LINK WHATSAPP ---")
        print(link)
        print('='*50)


# ── Resumo de etapas e proximas acoes ──────────────────────────────────────

def resumo_acoes():
    rows = carregar_pipeline()

    print('\n========== PROXIMAS ACOES ==========')

    acoes = {
        'novo':             'Primeiro contato',
        'contato_feito':    'Fazer followup',
        'interessado':      'Enviar exemplo da pagina',
        'proposta_enviada': 'Cobrar fechamento',
    }

    for status, acao in acoes.items():
        leads = [r for r in rows if r['status'] == status]
        if leads:
            print(f'\n[{acao.upper()}] — {len(leads)} leads')
            for lead in leads[:3]:
                print(f"  ID {lead['id']} | {lead['name']} | {lead['phone']}")
            if len(leads) > 3:
                print(f'  ... e mais {len(leads)-3}')

    print('\n=====================================')


if __name__ == '__main__':
    while True:
        print('\n--- CANAL DE VENDAS ---')
        print('1. Ver proximas acoes do funil')
        print('2. Gerar mensagem para proximo lead (novo)')
        print('3. Gerar mensagem para lead especifico (por ID)')
        print('0. Sair')

        opcao = input('\nOpcao: ').strip()

        if opcao == '1':
            resumo_acoes()
        elif opcao == '2':
            gerar_abordagem()
        elif opcao == '3':
            lead_id = input('ID do lead: ').strip()
            gerar_abordagem(lead_id)
        elif opcao == '0':
            break
