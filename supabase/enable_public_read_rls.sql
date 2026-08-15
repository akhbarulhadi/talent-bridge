-- ============================================================================
-- Enable public (anon/authenticated) READ access to master/config tables
-- used by the decision-tree game engine.
--
-- These tables hold reference/scenario data (not user data), so a public
-- SELECT-only policy is safe. This script does NOT grant insert/update/
-- delete to anon — only read.
--
-- Run this in the Supabase SQL editor if the app shows errors like:
--   "Problem statement unavailable"
--   "No decision available for this situation."
-- which usually mean RLS is enabled on the table with no read policy.
-- ============================================================================

alter table public.mst_title enable row level security;
alter table public.mst_skenario enable row level security;
alter table public.mst_problem_statement enable row level security;
alter table public.mst_decision enable row level security;

drop policy if exists "Public read mst_title" on public.mst_title;
create policy "Public read mst_title" on public.mst_title
  for select using (true);

drop policy if exists "Public read mst_skenario" on public.mst_skenario;
create policy "Public read mst_skenario" on public.mst_skenario
  for select using (true);

drop policy if exists "Public read mst_problem_statement" on public.mst_problem_statement;
create policy "Public read mst_problem_statement" on public.mst_problem_statement
  for select using (true);

drop policy if exists "Public read mst_decision" on public.mst_decision;
create policy "Public read mst_decision" on public.mst_decision
  for select using (true);
