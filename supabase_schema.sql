-- Execute no SQL Editor do Supabase

create table leads (
  id            bigint primary key,
  name          text not null,
  phone         text,
  category      text,
  rating        numeric(2,1),
  reviews       integer,
  city          text,
  location_link text,
  score         integer,
  status        text not null default 'novo'
                  check (status in (
                    'novo','contato_feito','interessado',
                    'proposta_enviada','fechado','perdido'
                  )),
  data_contato  date,
  observacao    text,
  instagram     text,
  email         text,
  updated_at    timestamptz default now()
);

alter table leads enable row level security;
create policy "allow_all" on leads for all using (true) with check (true);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();
