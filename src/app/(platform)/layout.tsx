import { requireUser } from "@/platform/auth/require-user";

/** Everything under (platform) is private. The proxy redirects early; this is the real check. */
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}
