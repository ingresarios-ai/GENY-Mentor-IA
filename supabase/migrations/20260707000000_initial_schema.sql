-- Profiles (Configuración y Preferencias)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  modo TEXT DEFAULT 'explorador',
  ai_provider TEXT DEFAULT 'free',
  ai_model TEXT,
  ai_base_url TEXT,
  ai_key TEXT,
  ghl_token TEXT,
  ghl_location_id TEXT,
  ghl_email TEXT,
  partner_nombre TEXT,
  partner_tel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Trades (Bitácora)
CREATE TABLE public.trades (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  estrategia TEXT,
  strikes TEXT,
  riesgo_max TEXT,
  fecha TEXT,
  status TEXT DEFAULT 'abierto',
  pnl NUMERIC,
  plan_respetado BOOLEAN,
  leccion TEXT,
  tesis TEXT,
  checklist_ok BOOLEAN,
  geny_trend TEXT,
  sniper BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TEXT
);
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own trades" ON public.trades FOR ALL USING (auth.uid() = user_id);


-- Reto21 (Estado del Reto 21 Días)
CREATE TABLE public.reto21 (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  start_date TEXT,
  days JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.reto21 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reto21" ON public.reto21 FOR ALL USING (auth.uid() = user_id);

-- Game (Gamificación, XP, Rachas)
CREATE TABLE public.game (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  xp_total INTEGER DEFAULT 0,
  escudos INTEGER DEFAULT 0,
  escudo_dates JSONB DEFAULT '[]'::jsonb,
  activity JSONB DEFAULT '{}'::jsonb,
  awarded_keys JSONB DEFAULT '[]'::jsonb,
  wager JSONB,
  last_wager JSONB,
  badges JSONB DEFAULT '[]'::jsonb,
  weekly_xp JSONB DEFAULT '{}'::jsonb,
  mental_edge JSONB,
  chat_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  apuestas_ganadas INTEGER DEFAULT 0,
  racha_max INTEGER DEFAULT 0
);
ALTER TABLE public.game ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own game" ON public.game FOR ALL USING (auth.uid() = user_id);

-- Trigger to create reto21 and game row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.reto21 (user_id) VALUES (new.id);
  INSERT INTO public.game (user_id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_stats();


-- Videos (Academia)
CREATE TABLE public.videos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT,
  yt_id TEXT,
  categoria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own videos" ON public.videos FOR ALL USING (auth.uid() = user_id);
