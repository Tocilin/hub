import { E2E_EMAIL, E2E_UNAPPROVED_EMAIL } from "./support/constants";
import { ensureUser } from "./support/supabase";

export default async function globalSetup() {
  await ensureUser(E2E_EMAIL);
  await ensureUser(E2E_UNAPPROVED_EMAIL);
}
