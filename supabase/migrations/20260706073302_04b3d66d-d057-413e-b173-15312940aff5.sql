
CREATE POLICY "Users manage own domain_throttle rows" ON public.domain_throttle
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own sender_warmup rows" ON public.sender_warmup
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own linkedin_groups_research rows" ON public.linkedin_groups_research
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
