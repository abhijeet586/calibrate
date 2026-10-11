-- =============================================================================
-- FIX: Automated User Profile Creation & Permissive Policies
-- Run this query once in your Supabase SQL Editor (New Query -> Run)
-- =============================================================================

-- 1. Permissive RLS policies for profiles & users table insertion
DROP POLICY IF EXISTS "Allow insert profile on signup" ON public.profiles;
CREATE POLICY "Allow insert profile on signup" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert user on signup" ON public.users;
CREATE POLICY "Allow insert user on signup" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "User write own profile" ON public.profiles;
CREATE POLICY "User write own profile" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "User write own user" ON public.users;
CREATE POLICY "User write own user" ON public.users FOR ALL USING (true);

-- 2. Automatic trigger when ANY user signs up (via Email or Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
