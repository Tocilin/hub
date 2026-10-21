import { PageHeader } from "@/components/platform/page-header";
import { ThemeControl } from "@/components/platform/theme-control";

// Temporary home until the launcher lands in Milestone 3.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-gutter py-12">
      <PageHeader title="HUB" description="Your personal apps, in one place." />
      <ThemeControl />
    </main>
  );
}
