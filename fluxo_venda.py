"""
Fluxo de vendas - Leadpage para restaurantes
Status possíveis: novo → contato_feito → interessado → proposta_enviada → fechado → perdido
"""
import csv
import json
import os
from datetime import date

LEADS_FILE = 'leads_qualificados.csv'
PIPELINE_FILE = 'pipeline.csv'

PIPELINE_CAMPOS = [
    'id', 'name', 'phone', 'category', 'rating', 'reviews',
    'city', 'location_link', 'score', 'status', 'data_contato', 'observacao'
]

STATUS_ORDEM = ['novo', 'contato_feito', 'interessado', 'proposta_enviada', 'fechado', 'perdido']


# ── Pontuação para priorizar abordagem ──────────────────────────────────────

def calcular_score(lead):
    score = 0
    rating = float(lead.get('rating') or 0)
    reviews = int(lead.get('reviews') or 0)

    if rating >= 4.5:
        score += 3
    elif rating >= 4.0:
        score += 2
    else:
        score += 1

    if reviews >= 500:
        score += 3
    elif reviews >= 200:
        score += 2
    else:
        score += 1

    return score


# ── Inicializa pipeline a partir dos leads (só roda uma vez) ────────────────

def inicializar_pipeline():
    if os.path.exists(PIPELINE_FILE):
        return

    with open(LEADS_FILE, encoding='utf-8-sig') as f:
        leads = list(csv.DictReader(f))

    rows = []
    for i, lead in enumerate(leads, start=1):
        rows.append({
            'id': i,
            'name': lead['name'],
            'phone': lead['phone'],
            'category': lead['category'],
            'rating': lead['rating'],
            'reviews': lead['reviews'],
            'city': lead['city'],
            'location_link': lead['location_link'],
            'score': calcular_score(lead),
            'status': 'novo',
            'data_contato': '',
            'observacao': '',
        })

    # Ordena por score decrescente (melhores primeiro)
    rows.sort(key=lambda x: int(x['score']), reverse=True)

    with open(PIPELINE_FILE, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=PIPELINE_CAMPOS)
        writer.writeheader()
        writer.writerows(rows)

    print(f'Pipeline criado com {len(rows)} leads -> {PIPELINE_FILE}')


# ── Carrega pipeline ────────────────────────────────────────────────────────

def carregar_pipeline():
    with open(PIPELINE_FILE, encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def salvar_pipeline(rows):
    with open(PIPELINE_FILE, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=PIPELINE_CAMPOS)
        writer.writeheader()
        writer.writerows(rows)


# ── Insights ────────────────────────────────────────────────────────────────

def mostrar_insights():
    rows = carregar_pipeline()

    total = len(rows)
    por_status = {s: 0 for s in STATUS_ORDEM}
    for r in rows:
        por_status[r['status']] = por_status.get(r['status'], 0) + 1

    print('\n========== INSIGHTS DO PIPELINE ==========')
    print(f'Total de leads: {total}')
    print()
    print(f'  Novos (nao contactados): {por_status["novo"]}')
    print(f'  Contato feito:           {por_status["contato_feito"]}')
    print(f'  Interessados:            {por_status["interessado"]}')
    print(f'  Proposta enviada:        {por_status["proposta_enviada"]}')
    print(f'  Fechados:                {por_status["fechado"]}')
    print(f'  Perdidos:                {por_status["perdido"]}')

    fechados = por_status['fechado']
    contactados = total - por_status['novo']
    taxa = (fechados / contactados * 100) if contactados > 0 else 0
    print(f'\n  Taxa de conversao: {taxa:.1f}% ({fechados}/{contactados} contactados)')
    print('==========================================\n')


# ── Proximos leads para abordar ─────────────────────────────────────────────

def proximos_leads(quantidade=5):
    rows = carregar_pipeline()
    novos = [r for r in rows if r['status'] == 'novo']

    if not novos:
        print('Sem leads novos para abordar.')
        return

    print(f'\n===== PROXIMOS {quantidade} LEADS PARA ABORDAR =====')
    for lead in novos[:quantidade]:
        score_str = '*' * int(lead['score'])
        print(f"\n[ID {lead['id']}] {lead['name']}")
        print(f"  Telefone : {lead['phone']}")
        print(f"  Categoria: {lead['category']}")
        print(f"  Rating   : {lead['rating']} ({lead['reviews']} reviews)")
        print(f"  Maps     : {lead['location_link']}")
        print(f"  Score    : {score_str} ({lead['score']}/6)")
    print('=' * 45)


# ── Atualiza status de um lead ──────────────────────────────────────────────

def atualizar_status(lead_id, novo_status, observacao=''):
    if novo_status not in STATUS_ORDEM:
        print(f'Status invalido. Use: {", ".join(STATUS_ORDEM)}')
        return

    rows = carregar_pipeline()
    encontrado = False

    for row in rows:
        if str(row['id']) == str(lead_id):
            row['status'] = novo_status
            row['data_contato'] = str(date.today())
            if observacao:
                row['observacao'] = observacao
            encontrado = True
            print(f'Lead {lead_id} ({row["name"]}) atualizado para: {novo_status}')
            break

    if not encontrado:
        print(f'Lead ID {lead_id} nao encontrado.')
        return

    salvar_pipeline(rows)


# ── Exporta apenas os fechados ──────────────────────────────────────────────

def exportar_fechados():
    rows = carregar_pipeline()
    fechados = [r for r in rows if r['status'] == 'fechado']

    if not fechados:
        print('Nenhum lead fechado ainda.')
        return

    with open('leads_fechados.csv', 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=PIPELINE_CAMPOS)
        writer.writeheader()
        writer.writerows(fechados)

    print(f'{len(fechados)} leads fechados exportados -> leads_fechados.csv')


# ── Menu principal ──────────────────────────────────────────────────────────

if __name__ == '__main__':
    inicializar_pipeline()

    while True:
        print('\n--- MENU ---')
        print('1. Ver insights')
        print('2. Proximos leads para abordar')
        print('3. Atualizar status de lead')
        print('4. Exportar leads fechados')
        print('0. Sair')

        opcao = input('\nOpcao: ').strip()

        if opcao == '1':
            mostrar_insights()

        elif opcao == '2':
            qtd = input('Quantos leads mostrar? [5]: ').strip()
            proximos_leads(int(qtd) if qtd.isdigit() else 5)

        elif opcao == '3':
            lead_id = input('ID do lead: ').strip()
            print(f'Status: {", ".join(STATUS_ORDEM)}')
            status = input('Novo status: ').strip()
            obs = input('Observacao (opcional): ').strip()
            atualizar_status(lead_id, status, obs)

        elif opcao == '4':
            exportar_fechados()

        elif opcao == '0':
            break
