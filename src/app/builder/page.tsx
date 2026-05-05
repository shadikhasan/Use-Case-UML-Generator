import type { Metadata } from "next";
import Link from "next/link";
import UseCaseUMLBuilder from "@/components/UseCaseUMLBuilder";

export const metadata: Metadata = {
  title: "Interactive UML Builder",
  description:
    "Design use case UML diagrams with actor placement, relationship modeling, live preview, and export options.",
  alternates: {
    canonical: "/builder",
  },
};

export default function BuilderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-amber-50">
      <header className="sticky top-0 z-40 border-b border-white/45 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-10">
          <Link href="/" className="text-sm font-semibold tracking-wide text-sky-900">
            UML UseCase Studio
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <UseCaseUMLBuilder />
    </main>
  );
}
