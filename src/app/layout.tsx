import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "My Tasks",
  description: "Keep track of what needs to get done.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
