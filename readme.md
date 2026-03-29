# 📡 Maps Radar — Prospecção Digital de Empresas Sem Site

Ferramenta de geração de leads qualificados a partir de dados do Google Maps.
O objetivo é identificar empresas com **alta presença digital no Maps** (muitas avaliações, boa nota) mas que **ainda não possuem site** — o perfil ideal de prospect para serviços de presença digital.

---

## 🎯 Objetivo

Encontrar empresas que:
- Têm **+100 avaliações no Google Maps** (presença digital comprovada)
- **Não possuem site** cadastrado
- Têm **telefone** disponível para contato
- Estão **ativas e operacionais**

Essas empresas já investem na sua presença no Maps mas não converteram isso em um site — são leads de alta qualidade para serviços de criação de sites, marketing digital e gestão de presença online.

---

## 🗂️ Estrutura do Projeto

```
maps-radar/
│
├── README.md                    # Este arquivo
├── maps-analyzer.html           # Ferramenta visual (abre no navegador)
├── outscraper_leads.py          # Script de coleta via API do Outscraper
└── leads/                       # Pasta de saída dos CSVs gerados
    └── .gitkeep
```

---

## 🛠️ Ferramenta Visual — `maps-analyzer.html`

Arquivo HTML que roda direto no navegador, sem instalação.

**Como usar:**
1. Abra o arquivo `maps-analyzer.html` em qualquer navegador
2. Arraste ou selecione um arquivo CSV exportado do Google Maps / Outscraper
3. A ferramenta filtra automaticamente as empresas **sem site**
4. Ordena por **Score de Presença Digital** (quanto maior, melhor lead)
5. Para cada empresa, há botões de busca rápida:
   - ✉ **E-mail** — Google direto com busca de contato
   - 📷 **IG** — Instagram
   - 👤 **FB** — Facebook
   - 💼 **LI** — LinkedIn
   - 💬 **WA** — WhatsApp (se tiver telefone)
   - 🌐 **Redes** — Busca ampla de redes sociais
6. Exporte a lista filtrada em CSV com o botão **⬇ Exportar CSV**

**Score de Presença Digital (0–100):**
| Fator | Peso |
|---|---|
| Número de reviews (até 500) | 60% |
| Nota média (0–5 estrelas) | 20% |
| Possui telefone cadastrado | 20% |

---

## 🤖 Coleta Automatizada — API Outscraper

### Por que Outscraper?

A **Google Places API oficial** cobra ~$17 por 1.000 requisições para dados de contato. O Outscraper oferece os mesmos dados por **$3 por 1.000 registros** com filtros avançados e enriquecimento de e-mail/redes sociais.

### Preços Outscraper (pay-as-you-go)

| Volume | Preço por 1.000 registros |
|---|---|
| Primeiros 500 | **Gratuito** |
| 501 até 100.000 | $3,00 |
| Acima de 100.000 | $1,00 |

> O enriquecimento de e-mails e redes sociais é cobrado separadamente.

### Instalação

```bash
pip install outscraper
```

### Configuração

1. Crie uma conta em [outscraper.com](https://outscraper.com)
2. Gere sua API key em **Profile → API Token**
3. Crie um arquivo `.env` na raiz do projeto:

```env
OUTSCRAPER_API_KEY=sua_chave_aqui
```

### Script de Coleta (`outscraper_leads.py`)

```python
import outscraper
import os
import csv

API_KEY = os.getenv('OUTSCRAPER_API_KEY')
client = outscraper.ApiClient(API_KEY)

# Configurações da busca
CATEGORIA   = 'restaurantes'
CIDADE      = 'Belo Horizonte, MG, BR'
MIN_REVIEWS = 100   # Filtro aplicado localmente após coleta
LIMITE      = 500   # Máximo de resultados por query

results = client.google_maps_search(
    [f'{CATEGORIA}, {CIDADE}'],
    limit=LIMITE,
    language='pt',
    # Filtros aplicados ANTES da cobrança (reduzem custo)
    filters=[
        ['site', 'is blank', ''],          # Só sem site
        ['phone', 'is not blank', ''],     # Só com telefone
        ['business_status', 'equals', 'OPERATIONAL'],  # Só ativas
    ],
    dropDuplicates=True,
)

# Filtro local por mínimo de reviews (não disponível como parâmetro nativo)
leads = [r for r in results if r.get('reviews', 0) >= MIN_REVIEWS]

# Exporta para CSV
campos = ['name', 'category', 'phone', 'rating', 'reviews', 'address', 'city']

with open('leads/output.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=campos, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(leads)

print(f'✅ {len(leads)} leads qualificados exportados para leads/output.csv')
```

**Execute:**
```bash
python outscraper_leads.py
```

---

## 🔍 Filtros Disponíveis na API do Outscraper

### Filtros nativos (aplicados antes da cobrança ✅)

| Campo | Operador | Uso |
|---|---|---|
| `site` | `is blank` | Só empresas sem site |
| `phone` | `is not blank` | Só empresas com telefone |
| `business_status` | `equals OPERATIONAL` | Só empresas ativas |
| `rating` | `starts with 4` | Só notas 4.x ou 5.x |
| `subtype` | `contains one of` | Filtrar categoria exata |
| `city` | `equals` | Filtrar por cidade específica |
| `postal_code` | `starts with` | Filtrar por CEP/região |

### Filtros locais (aplicados após a coleta ⚠️ — você já pagou pelos registros)

| Campo | Exemplo |
|---|---|
| `reviews >= 100` | Mínimo de avaliações |
| `photos_count >= 5` | Empresas com fotos |
| `reviews_per_score_5 > 50` | Com muitas avaliações 5 estrelas |

> **⚠️ Importante:** O Outscraper **não possui filtro nativo por número mínimo de reviews**. A estratégia é combinar os filtros nativos (sem site + com telefone + ativo) para reduzir o volume antes da cobrança, e aplicar o corte de reviews localmente no script.

---

## 📦 Enriquecimento de Contatos (Opcional)

O Outscraper oferece o serviço **Emails & Contacts Scraper** que adiciona ao resultado:
- 📧 E-mail do domínio/empresa
- 📘 Link do Facebook
- 📷 Link do Instagram
- 🐦 Link do Twitter/X
- 💼 Link do LinkedIn
- 📺 Link do YouTube

Para ativar, adicione o parâmetro `domains_service=True` na chamada da API ou selecione "Emails & Contacts Scraper" na interface web.

> Verificar preço atual em [outscraper.com/pricing](https://outscraper.com/pricing)

---

## 📊 Fontes de Dados Suportadas pela Ferramenta Visual

O arquivo `maps-analyzer.html` reconhece automaticamente colunas com estes nomes (em PT ou EN):

| Dado | Nomes reconhecidos |
|---|---|
| Nome | `name`, `nome`, `título`, `empresa` |
| Categoria | `category`, `categoria`, `tipo` |
| Endereço | `address`, `endereço`, `localização` |
| Telefone | `phone`, `telefone`, `tel`, `fone` |
| Avaliação | `rating`, `avaliação`, `nota`, `stars` |
| Reviews | `reviews`, `avaliações`, `review count` |
| Site | `website`, `site`, `url`, `web` |

---

## 🚀 Fluxo Recomendado

```
1. Defina categoria + cidade alvo
         ↓
2. Execute outscraper_leads.py
   (filtra: sem site + com telefone + ativo + ≥100 reviews)
         ↓
3. Abra leads/output.csv no maps-analyzer.html
         ↓
4. Ordene por Score de Presença Digital
         ↓
5. Use os botões de busca rápida para encontrar
   e-mail e redes sociais de cada empresa
         ↓
6. Exporte CSV final para seu CRM
```

---

## 📌 Observações Importantes

- O Google Maps limita os resultados a **400–500 por query**. Para cidades grandes, divida a busca por bairros ou subcategorias.
- Os dados do Outscraper ficam disponíveis por **30 dias** nos servidores deles.
- Para evitar duplicatas entre múltiplas buscas, use o campo `google_id` como identificador único.
- A ferramenta visual funciona 100% offline — nenhum dado é enviado a servidores externos.

---

## 🔗 Referências

- [Outscraper — Documentação da API](https://app.outscraper.com/api-docs)
- [Outscraper — Filtros Avançados](https://outscraper.com/google-maps-data-scraper-filters/)
- [Outscraper — Emails & Contacts Scraper](https://outscraper.com/emails-scraper/)
- [Google Maps Platform — Preços](https://mapsplatform.google.com/pricing/)