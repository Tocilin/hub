-- Follow-up to 20261021120000_private_by_default.sql.
--
-- Postgres grants EXECUTE on new functions to PUBLIC (every role, including `anon`)
-- through a *global* default. Schema-scoped `alter default privileges ... in schema`
-- can only add to that, so the earlier revoke did not stop `anon` from executing new
-- functions. Remove the global default for functions created by `postgres`.
-- `authenticated` and `service_role` keep their explicit grants in `public`;
-- functions in other schemas need explicit grants, which is the intent.

alter default privileges for role postgres
  revoke execute on functions from public;
