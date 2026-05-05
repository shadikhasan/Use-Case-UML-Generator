import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Use Case UML Generator",
    template: "%s | Use Case UML Generator",
  },
  description:
    "Create and refine use case UML diagrams online with live preview, best-practice relationships, and export to PNG, SVG, PDF, or JSON.",
  keywords: [
    "use case diagram",
    "UML generator",
    "use case UML tool",
    "system modeling",
    "UML builder",
  ],
  authors: [{ name: "Shadik" }],
  creator: "Shadik",
  publisher: "UML UseCase Studio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Use Case UML Generator",
    description:
      "Build and refine professional use case diagrams quickly with live preview and multi-format exports.",
    siteName: "Use Case UML Generator",
    images: [
      {
        url: "/use-case-diagram.png",
        width: 1200,
        height: 630,
        alt: "Use Case UML Generator diagram preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Use Case UML Generator",
    description:
      "Build and refine professional use case diagrams quickly with live preview and multi-format exports.",
    images: ["/use-case-diagram.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
