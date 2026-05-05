import type { Metadata } from "next";
import SiteNavbar from "@/components/SiteNavbar";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact and developer details for UML UseCase Studio.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-amber-50">
      <SiteNavbar currentPath="/contact" />

      <section className="mx-auto max-w-8xl px-6 py-12 md:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm md:p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">UML UseCase Studio</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Contact</h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            For product questions, collaboration, or support, use the details below.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold">Contact</h2>
              <p className="mt-2 text-sm text-muted-foreground">Name: EKRAMUL ISLAM SHADIK</p>
              <p className="mt-1 text-sm text-muted-foreground">Product: UML UseCase Studio</p>
              <a
                href="https://github.com/shadikhasan"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-sky-700 hover:text-sky-800"
              >
                GitHub: github.com/shadikhasan
              </a>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
