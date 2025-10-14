-- Создаем enum для ролей пользователей
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Создаем таблицу для ролей пользователей
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Включаем RLS для user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Функция для проверки роли (security definer чтобы избежать рекурсии в RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Создаем таблицу для аниме
CREATE TABLE public.anime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  genre TEXT,
  release_year INTEGER,
  episodes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS для anime
ALTER TABLE public.anime ENABLE ROW LEVEL SECURITY;

-- Политики для anime: все могут читать, только админы могут изменять
CREATE POLICY "Все могут просматривать аниме"
ON public.anime FOR SELECT
USING (true);

CREATE POLICY "Только админы могут создавать аниме"
ON public.anime FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут обновлять аниме"
ON public.anime FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут удалять аниме"
ON public.anime FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Создаем таблицу для рекламы
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS для advertisements
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Политики для advertisements: все могут читать активную рекламу, только админы управляют
CREATE POLICY "Все могут видеть активную рекламу"
ON public.advertisements FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут создавать рекламу"
ON public.advertisements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут обновлять рекламу"
ON public.advertisements FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Только админы могут удалять рекламу"
ON public.advertisements FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_anime_updated_at
BEFORE UPDATE ON public.anime
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Вставляем тестовые данные для аниме
INSERT INTO public.anime (title, description, image_url, video_url, rating, genre, release_year, episodes) VALUES
('Атака титанов', 'Эпическая история о человечестве, заключённом за стенами, защищающими от гигантских титанов. Эрен Йегер и его друзья вступают в армию, чтобы сражаться с этими чудовищами и раскрыть тайны своего мира.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477', 'https://www.youtube.com/embed/LHtdKWJdif4', 9.0, 'Экшен, Драма, Фэнтези', 2013, 87),
('Стальной алхимик', 'Братья Эдвард и Альфонс Элрики пытаются вернуть свои тела после неудачной попытки воскресить мать с помощью алхимии. Они отправляются в путешествие, полное опасностей и открытий.', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f', 'https://www.youtube.com/embed/--IcmZkvL0Q', 9.1, 'Экшен, Приключения, Фэнтези', 2009, 64),
('Тетрадь смерти', 'Лайт Ягами находит загадочную тетрадь, которая может убивать людей. Начинается интеллектуальная битва между ним и гениальным детективом Л.', 'https://images.unsplash.com/photo-1618945524163-32451704596c', 'https://www.youtube.com/embed/NlJZ-YgAt-c', 8.6, 'Детектив, Триллер, Супернатурал', 2006, 37);