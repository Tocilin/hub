"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Light / Dark / System theming. The choice persists per device in localStorage. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
