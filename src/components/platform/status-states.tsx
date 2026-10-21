import type { LucideIcon } from "lucide-react";
import { CircleAlert, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

type StateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** A primary next step, e.g. a retry button or a link home. */
  action?: React.ReactNode;
  className?: string;
};

function StatePanel({
  title,
  description,
  icon: Icon,
  action,
  className,
  tone,
  ...rest
}: StateProps & { tone: "neutral" | "error"; role?: "alert" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        className,
      )}
      {...rest}
    >
      {Icon && (
        <div
          className={cn(
            "grid size-12 place-items-center rounded-2xl",
            tone === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon aria-hidden="true" className="size-6" />
        </div>
      )}
      <div className="max-w-sm space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-pretty text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Nothing to show yet — not an error. */
export function EmptyState({ icon = Inbox, ...props }: StateProps) {
  return <StatePanel icon={icon} tone="neutral" {...props} />;
}

/** Something failed. Announced to screen readers; never shows raw error details. */
export function ErrorState({ icon = CircleAlert, ...props }: StateProps) {
  return <StatePanel icon={icon} tone="error" role="alert" {...props} />;
}
