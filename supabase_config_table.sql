-- Execute no SQL Editor do Supabase

create table search_config (
  id            integer primary key default 1,
  category      text    default 'restaurantes',
  city          text    default 'Belo Horizonte',
  state         text    default 'MG',
  country       text    default 'BR',
  min_rating    numeric default 4.0,
  min_reviews   integer default 100,
  limit_results integer default 100,
  updated_at    timestamptz default now()
);

-- Garante que só existe uma linha de config
alter table search_config add constraint single_row check (id = 1);

-- Linha inicial
insert into search_config (id) values (1);

alter table search_config enable row level security;
create policy "allow_all" on search_config for all using (true) with check (true);
