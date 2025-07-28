-- -----------------------------------------------------------------------------------------------
-- WeStudy - Supabase Database Setup Script
-- -----------------------------------------------------------------------------------------------
-- Este script cria todas as tabelas, relacionamentos e políticas de segurança necessárias
-- para o funcionamento do aplicativo WeStudy.
--
-- **Como usar:**
-- 1. Vá para o seu projeto no painel do Supabase.
-- 2. Navegue até o "SQL Editor".
-- 3. Cole todo o conteúdo deste arquivo e clique em "RUN".
-- -----------------------------------------------------------------------------------------------


-- ----------------------------------------
-- Tabela 1: profiles
-- Armazena dados públicos dos usuários, estendendo a tabela `auth.users`.
-- ----------------------------------------

CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text UNIQUE,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Comentários da tabela
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user, linked to auth.users.';


-- ----------------------------------------
-- Função e Gatilho (Trigger) para Sincronizar Novos Usuários
-- Copia os dados de um novo usuário da `auth.users` para a `public.profiles`.
-- ----------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, is_admin)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    (new.raw_user_meta_data->>'is_admin')::boolean
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gatilho que aciona a função após a criação de um novo usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ----------------------------------------
-- Políticas de Segurança (RLS) para `profiles`
-- ----------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles."
  ON public.profiles FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Admins can do anything."
  ON public.profiles FOR ALL
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );


-- ----------------------------------------
-- Tabela 2: categories
-- Armazena as categorias dos quartos (ex: Perto do Campus, Design).
-- ----------------------------------------

CREATE TABLE public.categories (
  id text NOT NULL PRIMARY KEY,
  label text NOT NULL,
  description text,
  icon_name text
);

-- Políticas de Segurança (RLS) para `categories`
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories."
  ON public.categories FOR SELECT
  USING (true);

-- Admins podem gerenciar categorias
CREATE POLICY "Admins can manage categories."
  ON public.categories FOR ALL
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );


-- ----------------------------------------
-- Tabela 3: listings
-- Tabela principal para os anúncios de quartos.
-- ----------------------------------------

CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  price_per_night numeric(10, 2) NOT NULL,
  address text,
  lat decimal,
  lng decimal,
  guests integer DEFAULT 1,
  bedrooms integer DEFAULT 1,
  beds integer DEFAULT 1,
  baths integer DEFAULT 1,
  rating numeric(3, 2) DEFAULT 0.00,
  reviews integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  host_id uuid NOT NULL REFERENCES public.profiles(id),
  category_id text REFERENCES public.categories(id),
  university_name text,
  university_acronym text,
  university_city text,
  cancellation_policy text,
  house_rules text,
  safety_and_property text
);

COMMENT ON TABLE public.listings IS 'Stores all room listing information.';

-- Políticas de Segurança (RLS) para `listings`
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available listings."
  ON public.listings FOR SELECT
  USING ( is_available = true );

CREATE POLICY "Hosts can create listings."
  ON public.listings FOR INSERT
  WITH CHECK ( auth.uid() = host_id );

CREATE POLICY "Hosts can update their own listings."
  ON public.listings FOR UPDATE
  USING ( auth.uid() = host_id );

CREATE POLICY "Admins can do anything on listings."
  ON public.listings FOR ALL
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );


-- ----------------------------------------
-- Tabela 4: listings_images
-- Armazena as URLs das imagens para cada anúncio.
-- ----------------------------------------

CREATE TABLE public.listings_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text
);

COMMENT ON TABLE public.listings_images IS 'Stores image URLs for each listing.';

-- Políticas de Segurança (RLS) para `listings_images`
ALTER TABLE public.listings_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view listing images." ON public.listings_images FOR SELECT USING (true);
CREATE POLICY "Admins or hosts can manage images." ON public.listings_images FOR ALL
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true OR (auth.uid() IN (SELECT host_id FROM listings WHERE id = listing_id)) );


-- ----------------------------------------
-- Tabela 5: bookings
-- Armazena as informações das reservas.
-- ----------------------------------------

CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  guests integer DEFAULT 1,
  status text NOT NULL DEFAULT 'Pendente', -- Pendente, Confirmada, Cancelada, Concluída
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.bookings IS 'Stores booking information.';

-- Políticas de Segurança (RLS) para `bookings`
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings."
  ON public.bookings FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can create bookings for themselves."
  ON public.bookings FOR INSERT
  WITH CHECK ( auth.uid() = user_id );
  
CREATE POLICY "Admins and hosts can view bookings for their listings."
  ON public.bookings FOR SELECT
  USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true OR (auth.uid() IN (SELECT host_id FROM listings WHERE id = listing_id)) );


-- ----------------------------------------
-- Tabelas 6, 7, 8: Mensagens (Chat)
-- ----------------------------------------

CREATE TABLE public.conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id uuid REFERENCES public.listings(id),
    created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.conversations IS 'Represents a message thread between users.';


CREATE TABLE public.conversation_participants (
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);
COMMENT ON TABLE public.conversation_participants IS 'Join table linking users to conversations.';


CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id),
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.messages IS 'Stores individual chat messages.';

-- Políticas de Segurança (RLS) para Mensagens
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their own conversations and participant info."
  ON public.conversations FOR SELECT
  USING ( id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()) );

CREATE POLICY "Participants can view their own participant entries."
  ON public.conversation_participants FOR SELECT
  USING ( user_id = auth.uid() OR conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()) );
  
CREATE POLICY "Participants can view messages in their conversations."
  ON public.messages FOR SELECT
  USING ( conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()) );

CREATE POLICY "Participants can send messages in their conversations."
  ON public.messages FOR INSERT
  WITH CHECK ( sender_id = auth.uid() AND conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()) );


-- ----------------------------------------
-- RPC (Remote Procedure Call) para buscar a última mensagem
-- Otimiza a busca da última mensagem para uma lista de conversas.
-- ----------------------------------------

CREATE OR REPLACE FUNCTION public.get_last_messages(p_conversation_ids uuid[])
RETURNS TABLE(
    conversation_id uuid,
    id uuid,
    content text,
    created_at timestamptz,
    sender_id uuid
)
LANGUAGE sql
AS $$
  SELECT
      m.conversation_id,
      m.id,
      m.content,
      m.created_at,
      m.sender_id
  FROM
      messages m
  INNER JOIN (
      SELECT
          conversation_id,
          MAX(created_at) AS max_created_at
      FROM
          messages
      WHERE
          conversation_id = ANY(p_conversation_ids)
      GROUP BY
          conversation_id
  ) AS last_msg
  ON m.conversation_id = last_msg.conversation_id AND m.created_at = last_msg.max_created_at;
$$;


-- ----------------------------------------
-- Dados Iniciais (Opcional)
-- Popula a tabela de categorias com os dados mockados.
-- ----------------------------------------

INSERT INTO public.categories (id, label, description, icon_name) VALUES
('design', 'Design', 'Quartos com decoração e design diferenciados.', 'Palette'),
('prox-campus', 'Perto do Campus', 'Quartos a uma curta distância da universidade.', 'School'),
('republica', 'Repúblicas', 'Vagas em repúblicas estudantis animadas.', 'Building'),
('kitnet', 'Kitnets', 'Espaços compactos e independentes.', 'Home'),
('alto-padrao', 'Alto Padrão', 'Quartos com luxo e comodidades premium.', 'Castle'),
('economico', 'Econômicos', 'Opções acessíveis para quem quer economizar.', 'Bed'),
('praia', 'Praia', 'Perto da praia.', 'Waves'),
('campo', 'Campo', 'Refúgios no campo.', 'Trees'),
('montanha', 'Montanhas', 'Cabanas e vistas incríveis.', 'MountainSnow'),
('deserto', 'Deserto', 'Aventura no deserto.', 'Sun'),
('camping', 'Camping', 'Experiências de acampamento.', 'Tent')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------------------------
-- Fim do Script
-- -----------------------------------------------------------------------------------------------