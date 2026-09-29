import type { ReactNode } from "react";
import type { Viewport } from "next";
import "./globals.css";

export const metadata = {
  title: "My Tasks",
  description: "Keep track of what needs to get done.",
};

// Colours the browser bar on phones to match the page, and tells the browser
// that this app is designed in light colours.
export const viewport: Viewport = {
  themeColor: "#faf9f7",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
