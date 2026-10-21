import type { Metadata } from "next";

import { AppShell } from "@/components/platform/app-shell";
import { ThemeControl } from "@/components/platform/theme-control";
import { Button } from "@/components/ui/button";
import { signOut } from "@/platform/auth/actions";
import { requireUser } from "@/platform/auth/require-user";

export const metadata: Metadata = { title: "Settings · HUB" };

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const headingId = `settings-${title.toLowerCase()}`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-raised sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <h2 id={headingId} className="font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <AppShell title="Settings" className="max-w-2xl space-y-4">
      <SettingsSection title="Appearance" description="Saved on this device.">
        <ThemeControl />
      </SettingsSection>
      <SettingsSection title="Account" description={`Signed in as ${user.email}`}>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="lg" className="h-11">
            Sign out
          </Button>
        </form>
      </SettingsSection>
    </AppShell>
  );
}
