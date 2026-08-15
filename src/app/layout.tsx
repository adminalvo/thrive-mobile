import { ReactNode } from "react";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="az">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
