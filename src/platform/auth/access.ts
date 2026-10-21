/** Pure access rules, shared by the proxy and server code. No I/O so they're easy to test. */

export const LOGIN_PATH = "/login";

export function isApprovedEmail(email: string | null | undefined, approvedEmail: string): boolean {
  return !!email && email.trim().toLowerCase() === approvedEmail.trim().toLowerCase();
}

export type RouteDecision =
  | { action: "allow" }
  | { action: "redirect"; to: string }
  /** Signed in, but not the approved identity: end the session, then go to login. */
  | { action: "reject"; to: string };

export function decideRoute({
  pathname,
  email,
  approvedEmail,
}: {
  pathname: string;
  /** Email from the session, or null when signed out. */
  email: string | null;
  approvedEmail: string;
}): RouteDecision {
  const onLogin = pathname === LOGIN_PATH;

  if (email === null) return onLogin ? { action: "allow" } : { action: "redirect", to: LOGIN_PATH };
  if (!isApprovedEmail(email, approvedEmail)) {
    return { action: "reject", to: `${LOGIN_PATH}?error=unauthorized` };
  }
  return onLogin ? { action: "redirect", to: "/" } : { action: "allow" };
}
