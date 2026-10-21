import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "HUB",
  description: "Private personal app launcher.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
