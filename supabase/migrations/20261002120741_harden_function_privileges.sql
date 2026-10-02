-- ==============================================================================
-- Migration: Harden function privileges and secure search_path
-- ==============================================================================

-- 1. Ensure increment_code_clicks is SECURITY DEFINER with fixed search_path = public
CREATE OR REPLACE FUNCTION public.increment_code_clicks(code_input TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.codes
  SET click_count = click_count + 1
  WHERE code = code_input;
END;
$$;

-- 2. Revoke execute on function from PUBLIC, anon, and authenticated roles
REVOKE EXECUTE ON FUNCTION public.increment_code_clicks(TEXT) FROM PUBLIC, anon, authenticated;

-- 3. Grant execute strictly to service_role
GRANT EXECUTE ON FUNCTION public.increment_code_clicks(TEXT) TO service_role;

-- 4. Secure update_articles_timestamp search_path as well to prevent search path hijacking
CREATE OR REPLACE FUNCTION public.update_articles_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
