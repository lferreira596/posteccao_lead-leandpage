"""
Importa pipeline.csv para o Supabase (rodar uma única vez).
Usa apenas 'requests' — sem dependências extras.

No PowerShell, rode assim:
  $env:SUPABASE_URL = "https://xxxx.supabase.co"
  $env:SUPABASE_SERVICE_KEY = "eyJ..."
  python import_to_supabase.py
"""
import csv
import json
import os
import requests

SUPABASE_URL = os.environ.get('SUPABASE_URL', '').rstrip('/')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    print('Defina as variaveis de ambiente antes de rodar:')
    print('  $env:SUPABASE_URL = "https://xxxx.supabase.co"')
    print('  $env:SUPABASE_SERVICE_KEY = "eyJ..."')
    exit(1)

with open('pipeline.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

leads = []
for r in rows:
    leads.append({
        'id':            int(r['id']),
        'name':          r['name'],
        'phone':         r['phone'] or None,
        'category':      r['category'] or None,
        'rating':        float(r['rating']) if r['rating'] else None,
        'reviews':       int(r['reviews']) if r['reviews'] else None,
        'city':          r['city'] or None,
        'location_link': r['location_link'] or None,
        'score':         int(r['score']) if r['score'] else 0,
        'status':        r['status'] or 'novo',
        'data_contato':  r['data_contato'] or None,
        'observacao':    r['observacao'] or None,
        'instagram':     None,
        'email':         None,
    })

headers = {
    'apikey':        SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type':  'application/json',
    'Prefer':        'resolution=merge-duplicates,return=minimal',
}

resp = requests.post(
    f'{SUPABASE_URL}/rest/v1/leads',
    headers=headers,
    data=json.dumps(leads),
)

if resp.status_code in (200, 201):
    print(f'{len(leads)} leads importados com sucesso.')
else:
    print(f'Erro {resp.status_code}: {resp.text}')
