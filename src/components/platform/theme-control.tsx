"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

type ThemeValue = (typeof themeOptions)[number]["value"];

function isThemeValue(value: string): value is ThemeValue {
  return themeOptions.some((option) => option.value === value);
}

const noopSubscribe = () => () => {};

export function ThemeControl({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known in the browser; render nothing selected on the server.
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return (
    <ToggleGroup
      type="single"
      size="lg"
      spacing={1}
      aria-label="Theme"
      value={isClient ? (theme ?? "system") : ""}
      // Radix emits "" when the active item is clicked again; keep the current theme instead.
      onValueChange={(value) => isThemeValue(value) && setTheme(value)}
      className={cn("rounded-xl bg-muted p-1", className)}
    >
      {themeOptions.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className="px-3 text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-raised dark:data-[state=on]:bg-input"
        >
          <Icon aria-hidden="true" />
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
