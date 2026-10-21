import type { AppColor, HubApp } from "@/platform/registry";
import { cn } from "@/lib/utils";

// Literal class names so Tailwind can detect them.
const colorClass: Record<AppColor, string> = {
  blue: "bg-app-blue",
  green: "bg-app-green",
  amber: "bg-app-amber",
  rose: "bg-app-rose",
  violet: "bg-app-violet",
  teal: "bg-app-teal",
  slate: "bg-app-slate",
};

const sizeClass = {
  sm: "size-8 rounded-[10px] [&_svg]:size-4",
  lg: "size-16 rounded-[22%] [&_svg]:size-8 md:size-[4.5rem] lg:size-20 lg:[&_svg]:size-9",
};

/** An app's identity mark: its icon on its color. Decorative — always pair it with the app name. */
export function AppIcon({
  app,
  size = "lg",
  className,
}: {
  app: Pick<HubApp, "icon" | "color">;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const Icon = app.icon;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center text-white shadow-raised",
        colorClass[app.color],
        sizeClass[size],
        className,
      )}
    >
      <Icon aria-hidden="true" strokeWidth={1.75} />
    </span>
  );
}
