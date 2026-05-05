import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Use Case UML Generator",
  description: "Interactive Use Case UML builder built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
