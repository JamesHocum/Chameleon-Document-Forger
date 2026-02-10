-- Create edit history table
CREATE TABLE IF NOT EXISTS public.edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  old_text TEXT,
  new_text TEXT,
  edited_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.edit_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'edit_history_select_own' AND tablename = 'edit_history') THEN
    CREATE POLICY "edit_history_select_own" ON public.edit_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'edit_history_insert_own' AND tablename = 'edit_history') THEN
    CREATE POLICY "edit_history_insert_own" ON public.edit_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
