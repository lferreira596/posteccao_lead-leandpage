import json
import csv

with open('leads_qualificados.json', encoding='utf-8') as f:
    leads = json.load(f)

campos = [
    'name',
    'phone',
    'address',
    'city',
    'state',
    'category',
    'rating',
    'reviews',
    'website',
    'location_link',
    'working_hours_csv_compatible',
]

with open('leads_qualificados.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=campos, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(leads)

print(f'{len(leads)} leads exportados -> leads_qualificados.csv')
