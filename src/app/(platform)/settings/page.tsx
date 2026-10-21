import type { Metadata } from "next";

import { AppShell } from "@/components/platform/app-shell";
import { ThemeControl } from "@/components/platform/theme-control";

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

export default function SettingsPage() {
  return (
    <AppShell title="Settings" className="max-w-2xl space-y-4">
      <SettingsSection title="Appearance" description="Saved on this device.">
        <ThemeControl />
      </SettingsSection>
      {/* Account and sign-out arrive with authentication in Milestone 4. */}
    </AppShell>
  );
}
