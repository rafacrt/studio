-- WeStudy Supabase Setup SQL
-- 
-- 1. Visão Geral:
-- Este script configura o banco de dados, autenticação e armazenamento para a aplicação WeStudy.
-- - Cria tabelas para perfis, anúncios, reservas, mensagens, etc.
-- - Estabelece relacionamentos com chaves estrangeiras.
-- - Implementa Políticas de Segurança a Nível de Linha (RLS) para proteger os dados.
-- - Adiciona Triggers e Funções para automatizar processos (ex: criar perfil de usuário).
-- - Configura um Storage Bucket para imagens dos anúncios.
--
-- 2. Como Usar:
-- Copie e cole todo o conteúdo deste arquivo no "SQL Editor" do seu projeto Supabase e execute.

-- EXTENSÕES (se necessário)
-- A extensão uuid-ossp já deve estar habilitada nos projetos Supabase.
-- create extension if not exists "uuid-ossp";

-- --------------------------------------------
-- 1. TABELA DE PERFIS DE USUÁRIOS (profiles)
-- Armazena dados públicos dos usuários, estendendo a tabela auth.users.
-- --------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  is_admin boolean default false,
  
  -- Campos de metadados
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint name_length check (char_length(name) >= 2)
);
-- Comentários da tabela
comment on table profiles is 'Tabela de perfis públicos dos usuários.';
comment on column profiles.id is 'Referência ao ID do usuário em auth.users.';
comment on column profiles.is_admin is 'Indica se o usuário é um administrador da plataforma.';

-- --------------------------------------------
-- 2. FUNÇÃO E TRIGGER PARA CRIAR PERFIL
-- Cria automaticamente um perfil para um novo usuário registrado.
-- --------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url, is_admin)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url', false);
  return new;
end;
$$ language plpgsql security definer;
-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --------------------------------------------
-- 3. TABELA DE CATEGORIAS (categories)
-- Armazena as categorias dos quartos.
-- --------------------------------------------
create table if not exists categories (
    id text primary key,
    label text not null,
    icon_name text,
    description text
);
comment on table categories is 'Categorias para os anúncios de quartos (ex: Perto do Campus, Kitnet).';

-- Inserir categorias padrão
insert into categories (id, label, icon_name, description) values
('design', 'Design', 'Palette', 'Quartos com decoração e design diferenciados.'),
('prox-campus', 'Perto do Campus', 'School', 'Quartos a uma curta distância da universidade.'),
('republica', 'Repúblicas', 'Building', 'Vagas em repúblicas estudantis animadas.'),
('kitnet', 'Kitnets', 'Home', 'Espaços compactos e independentes.'),
('alto-padrao', 'Alto Padrão', 'Castle', 'Quartos com luxo e comodidades premium.'),
('economico', 'Econômicos', 'Bed', 'Opções acessíveis para quem quer economizar.')
on conflict (id) do nothing;


-- --------------------------------------------
-- 4. TABELA DE ANÚNCIOS (listings)
-- Armazena os detalhes dos quartos disponíveis.
-- --------------------------------------------
create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references profiles(id) on delete cascade,
  category_id text references categories(id) on delete set null,
  
  title text not null,
  description text not null,
  address text not null,
  
  -- Informações da Universidade
  university_name text not null,
  university_acronym text not null,
  university_city text not null,
  
  -- Detalhes do Quarto
  price_per_night numeric(10, 2) not null,
  guests integer not null default 1,
  bedrooms integer not null default 1,
  beds integer not null default 1,
  baths integer not null default 1,
  
  -- Dados de localização
  lat numeric(9, 6),
  lng numeric(9, 6),

  -- Informações adicionais
  amenities jsonb,
  house_rules text,
  cancellation_policy text,
  safety_and_property text,
  
  -- Status e Avaliação
  is_available boolean default true not null,
  rating numeric(3, 2) default 0.00,
  reviews integer default 0,
  
  -- Campos de metadados
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint price_positive check (price_per_night > 0)
);
comment on table listings is 'Armazena todos os anúncios de quartos.';
comment on column listings.host_id is 'O usuário que é o anfitrião do quarto.';

-- --------------------------------------------
-- 5. TABELA DE IMAGENS DOS ANÚNCIOS (listings_images)
-- --------------------------------------------
create table if not exists listings_images (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid not null references listings(id) on delete cascade,
    url text not null,
    alt text,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table listings_images is 'URLs das imagens para cada anúncio.';

-- --------------------------------------------
-- 6. TABELA DE RESERVAS (bookings)
-- --------------------------------------------
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  
  check_in_date date not null,
  check_out_date date not null,
  total_price numeric(10, 2) not null,
  guests integer not null default 1,
  status text not null default 'Pendente', -- Pendente, Confirmada, Cancelada, Concluída
  
  -- Campos de metadados
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint check_in_before_check_out check (check_in_date < check_out_date)
);
comment on table bookings is 'Registros de reservas feitas pelos usuários.';

-- --------------------------------------------
-- 7. TABELAS DE MENSAGENS (conversations, messages, participants)
-- --------------------------------------------
create table if not exists conversations (
    id uuid primary key default uuid_generate_v4(),
    listing_id uuid references listings(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table conversations is 'Agrupa mensagens entre usuários sobre um anúncio.';

create table if not exists conversation_participants (
    conversation_id uuid not null references conversations(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    primary key (conversation_id, user_id)
);
comment on table conversation_participants is 'Tabela de junção para os participantes de uma conversa.';

create table if not exists messages (
    id uuid primary key default uuid_generate_v4(),
    conversation_id uuid not null references conversations(id) on delete cascade,
    sender_id uuid not null references auth.users(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table messages is 'Armazena cada mensagem individual dentro de uma conversa.';


-- --------------------------------------------
-- 8. STORAGE BUCKET PARA IMAGENS
-- Cria um bucket para armazenar imagens dos anúncios.
-- --------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing_images', 'listing_images', true, 5242880, '{"image/jpeg", "image/png", "image/webp"}')
on conflict (id) do nothing;

comment on table storage.buckets is 'Configuração dos buckets de armazenamento de arquivos.';

-- --------------------------------------------
-- 9. FUNÇÃO RPC PARA BUSCAR ÚLTIMA MENSAGEM
-- Melhora a performance ao buscar a lista de conversas.
-- --------------------------------------------
create or replace function get_last_messages(p_conversation_ids uuid[])
returns table (
    id uuid,
    conversation_id uuid,
    sender_id uuid,
    content text,
    created_at timestamptz
) as $$
begin
    return query
    select m.id, m.conversation_id, m.sender_id, m.content, m.created_at
    from messages m
    inner join (
        select ms.conversation_id, max(ms.created_at) as max_created_at
        from messages ms
        where ms.conversation_id = any(p_conversation_ids)
        group by ms.conversation_id
    ) lm on m.conversation_id = lm.conversation_id and m.created_at = lm.max_created_at
    where m.conversation_id = any(p_conversation_ids);
end;
$$ language plpgsql;


-- --------------------------------------------
-- 10. POLÍTICAS DE SEGURANÇA (ROW-LEVEL SECURITY - RLS)
-- Garante que os usuários só possam acessar e modificar seus próprios dados.
-- --------------------------------------------

-- Habilitar RLS em todas as tabelas
alter table profiles enable row level security;
alter table listings enable row level security;
alter table listings_images enable row level security;
alter table bookings enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;

-- Limpar políticas existentes para evitar conflitos
drop policy if exists "Qualquer pessoa pode ver perfis." on profiles;
drop policy if exists "Usuários podem inserir seus próprios perfis." on profiles;
drop policy if exists "Usuários podem atualizar seus próprios perfis." on profiles;
drop policy if exists "Anúncios são públicos." on listings;
drop policy if exists "Usuários podem criar anúncios." on listings;
drop policy if exists "Anfitriões podem atualizar seus próprios anúncios." on listings;
drop policy if exists "Anfitriões podem apagar seus próprios anúncios." on listings;
drop policy if exists "Imagens de anúncios são públicas." on listings_images;
drop policy if exists "Anfitriões podem adicionar imagens aos seus anúncios." on listings_images;
drop policy if exists "Anfitriões podem apagar imagens de seus anúncios." on listings_images;
drop policy if exists "Usuários podem ver suas próprias reservas." on bookings;
drop policy if exists "Usuários podem criar reservas." on bookings;
drop policy if exists "Usuários podem atualizar suas próprias reservas." on bookings;
drop policy if exists "Usuários podem ver conversas das quais participam." on conversations;
drop policy if exists "Usuários podem criar conversas." on conversations;
drop policy if exists "Usuários podem ver os participantes de suas conversas." on conversation_participants;
drop policy if exists "Usuários podem se adicionar como participantes." on conversation_participants;
drop policy if exists "Usuários podem ver mensagens em suas conversas." on messages;
drop policy if exists "Usuários podem enviar mensagens em suas conversas." on messages;


-- Políticas para `profiles`
create policy "Qualquer pessoa pode ver perfis." on profiles for select using (true);
create policy "Usuários podem inserir seus próprios perfis." on profiles for insert with check (auth.uid() = id);
create policy "Usuários podem atualizar seus próprios perfis." on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Políticas para `listings`
create policy "Anúncios são públicos." on listings for select using (true);
create policy "Usuários podem criar anúncios." on listings for insert with check (auth.uid() = host_id);
create policy "Anfitriões podem atualizar seus próprios anúncios." on listings for update using (auth.uid() = host_id) with check (auth.uid() = host_id);
create policy "Anfitriões podem apagar seus próprios anúncios." on listings for delete using (auth.uid() = host_id);

-- Políticas para `listings_images`
create policy "Imagens de anúncios são públicas." on listings_images for select using (true);
create policy "Anfitriões podem adicionar imagens aos seus anúncios." on listings_images for insert with check (
    (select host_id from listings where id = listing_id) = auth.uid()
);
create policy "Anfitriões podem apagar imagens de seus anúncios." on listings_images for delete using (
    (select host_id from listings where id = listing_id) = auth.uid()
);

-- Políticas para `bookings`
create policy "Usuários podem ver suas próprias reservas." on bookings for select using (auth.uid() = user_id or auth.uid() = (select host_id from listings where id = bookings.listing_id));
create policy "Usuários podem criar reservas." on bookings for insert with check (auth.uid() = user_id);
create policy "Usuários podem atualizar suas próprias reservas." on bookings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Políticas para `conversations` e `messages`
create policy "Usuários podem ver conversas das quais participam." on conversations for select using (
    id in (select conversation_id from conversation_participants where user_id = auth.uid())
);
create policy "Usuários podem criar conversas." on conversations for insert with check (true); -- Verificação de participante feita na tabela de junção

create policy "Usuários podem ver os participantes de suas conversas." on conversation_participants for select using (
    conversation_id in (select conversation_id from conversation_participants where user_id = auth.uid())
);
create policy "Usuários podem se adicionar como participantes." on conversation_participants for insert with check (user_id = auth.uid());

create policy "Usuários podem ver mensagens em suas conversas." on messages for select using (
    conversation_id in (select conversation_id from conversation_participants where user_id = auth.uid())
);
create policy "Usuários podem enviar mensagens em suas conversas." on messages for insert with check (
    sender_id = auth.uid() and conversation_id in (select conversation_id from conversation_participants where user_id = auth.uid())
);

-- Políticas para o Storage
drop policy if exists "Qualquer pessoa pode ver imagens" on storage.objects;
drop policy if exists "Usuários autenticados podem fazer upload de imagens" on storage.objects;

create policy "Qualquer pessoa pode ver imagens" on storage.objects for select
  using ( bucket_id = 'listing_images' );

create policy "Usuários autenticados podem fazer upload de imagens" on storage.objects for insert
  with check ( bucket_id = 'listing_images' and auth.role() = 'authenticated' );
