import json
import os
import requests
import outscraper

API_KEY = 'ODgxODNmYmJlMzhiNGJkNTg3ZjhiZTZmNDdmNzViMzl8MzhlZjY1YjBlYg'

# ── Lê configuração do Supabase ──────────────────────────────────────────────
SUPABASE_URL = os.environ.get('SUPABASE_URL', '').rstrip('/')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', '')

config = {
    'category':      'restaurantes',
    'city':          'Belo Horizonte',
    'state':         'MG',
    'country':       'BR',
    'min_rating':    4.0,
    'min_reviews':   100,
    'limit_results': 100,
}

if SUPABASE_URL and SUPABASE_ANON_KEY:
    resp = requests.get(
        f'{SUPABASE_URL}/rest/v1/search_config?id=eq.1&select=*',
        headers={'apikey': SUPABASE_ANON_KEY, 'Authorization': f'Bearer {SUPABASE_ANON_KEY}'}
    )
    if resp.status_code == 200 and resp.json():
        config.update(resp.json()[0])
        print(f'Config carregada do Supabase: {config["category"]}, {config["city"]}, {config["state"]}')
    else:
        print('Usando config padrao (Supabase nao respondeu).')
else:
    print('SUPABASE_URL/SUPABASE_ANON_KEY nao definidos — usando config padrao.')

# ── Busca no Google Maps ─────────────────────────────────────────────────────
query = f"{config['category']}, {config['city']}, {config['state']}, {config['country']}"
print(f'Buscando: {query} | limite: {config["limit_results"]}')

client = outscraper.ApiClient(API_KEY)
results = client.google_maps_search([query], limit=int(config['limit_results']), language='pt')

registros = [r for query_result in results for r in query_result]

# ── Filtros locais ───────────────────────────────────────────────────────────
leads_qualificados = [
    r for r in registros
    if r.get('reviews', 0) >= int(config['min_reviews'])
    and float(r.get('rating') or 0) >= float(config['min_rating'])
    and not r.get('website')
    and r.get('phone')
    and r.get('business_status') == 'OPERATIONAL'
]

# ── Deduplica pelo place_id ──────────────────────────────────────────────────
existentes = []
if os.path.exists('leads_qualificados.json'):
    with open('leads_qualificados.json', encoding='utf-8') as f:
        existentes = json.load(f)

ids_existentes = {r['place_id'] for r in existentes if r.get('place_id')}
novos = [r for r in leads_qualificados if r.get('place_id') not in ids_existentes]
todos = existentes + novos

with open('leads_qualificados.json', 'w', encoding='utf-8') as f:
    json.dump(todos, f, ensure_ascii=False, indent=2)

print(f'{len(novos)} novos leads | {len(existentes)} ja existiam | total: {len(todos)}')
