import json
import outscraper

API_KEY = 'ODgxODNmYmJlMzhiNGJkNTg3ZjhiZTZmNDdmNzViMzl8MzhlZjY1YjBlYg'  # substitua pelo valor real
client = outscraper.ApiClient(API_KEY)

results = client.google_maps_search(
    ['restaurantes, Belo Horizonte, MG, BR'],
    limit=100,
    language='pt',
)

# Achata lista de listas → lista de dicts
registros = [r for query_result in results for r in query_result]

# Filtros locais (SDK não suporta server-side filters nesse método)
leads_qualificados = [
    r for r in registros
    if r.get('reviews', 0) >= 100
    and not r.get('website')
    and r.get('phone')
    and r.get('business_status') == 'OPERATIONAL'
]

# Carrega leads já existentes e deduplica pelo place_id
import os
existentes = []
if os.path.exists('leads_qualificados.json'):
    with open('leads_qualificados.json', encoding='utf-8') as f:
        existentes = json.load(f)

ids_existentes = {r['place_id'] for r in existentes if r.get('place_id')}
novos = [r for r in leads_qualificados if r.get('place_id') not in ids_existentes]

todos = existentes + novos

with open('leads_qualificados.json', 'w', encoding='utf-8') as f:
    json.dump(todos, f, ensure_ascii=False, indent=2)

print(f'{len(novos)} novos leads adicionados | {len(existentes)} ja existiam | total: {len(todos)}')
