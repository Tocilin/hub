-- HUB is private: signed-out visitors (the `anon` role) never need database access.
--
-- Supabase grants `anon` privileges on new objects in `public` by default. Row Level
-- Security still guards every row, but removing these grants is defense in depth if a
-- future table ever ships without RLS. Objects created by migrations run as `postgres`.

alter default privileges for role postgres in schema public
  revoke all on tables from anon;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, public;
