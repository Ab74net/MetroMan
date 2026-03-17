import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Washington DC Metro 3D Map",
  description: "Foundation for the real-time Metro map experience."
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="app-layout">{children}</body>
    </html>
  );
}
