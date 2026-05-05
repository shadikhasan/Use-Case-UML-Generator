import Link from "next/link";
import type { Metadata } from "next";
import SiteNavbar from "@/components/SiteNavbar";

export const metadata: Metadata = {
  title: "Online Use Case Diagram Builder",
  description:
    "Generate, refine, and export use case UML diagrams with a guided workflow, live preview, and consistent modeling structure.",
  alternates: {
    canonical: "/",
  },
};

const steps = [
  {
    title: "Set System + Actors",
    description: "Name your system, then add actors and place them on left or right side.",
  },
  {
    title: "Add Use Cases + Modules",
    description: "Create use cases, group them by module, and connect relationships.",
  },
  {
    title: "Review, Refine, Export",
    description: "Use live preview, JSON sync, undo/redo, then export PNG, SVG, PDF, or JSON.",
  },
];

const features = [
  {
    title: "AI-Inspired Workflow",
    description: "Move from text input to a complete use case diagram with a guided flow.",
  },
  {
    title: "Intelligent Refinement",
    description: "Iteratively strengthen relationships and uncover missing modeling details.",
  },
  {
    title: "UML Best-Practice Friendly",
    description: "Model includes, extends, actor boundaries, and system scopes with consistency.",
  },
  {
    title: "Live Preview + Exports",
    description: "Visualize instantly and export to PNG, SVG, PDF, and JSON for delivery.",
  },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Use Case UML Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Create and refine use case UML diagrams online with live preview and exports to PNG, SVG, PDF, and JSON.",
    url: "/",
    creator: {
      "@type": "Person",
      name: "Shadik",
      sameAs: "https://github.com/shadikhasan",
    },
    publisher: {
      "@type": "Organization",
      name: "UML UseCase Studio",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@umlusecasestudio.com",
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cyan-50 via-sky-50 to-amber-50 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-9rem] h-80 w-80 rounded-full bg-cyan-300/65 blur-3xl" />
        <div className="absolute right-[-12rem] top-16 h-96 w-96 rounded-full bg-fuchsia-300/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/55 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-emerald-200/45 blur-3xl" />
      </div>

      <SiteNavbar currentPath="/" />

      <section className="mx-auto max-w-8xl px-6 pb-10 pt-10 md:px-10 md:pt-16">
        <div className="space-y-6">
          <div className="rounded-3xl border border-sky-200/80 bg-white/80 p-8 shadow-sm backdrop-blur md:p-10">
            <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
              USE CASE MODELING STUDIO
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Effortless Use Case Diagrams with a Refine-First Workflow
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              Describe your system, generate a diagram, then refine structure quality quickly. Build polished UML outputs
              without manual diagram overhead.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/builder"
                className="rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                Try It Now
              </Link>
              <a
                href="#how"
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-2xl font-bold">3 Steps</p>
                <p className="text-sm text-muted-foreground">Describe, generate, refine</p>
              </div>
              <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-4">
                <p className="text-2xl font-bold">Live</p>
                <p className="text-sm text-muted-foreground">Preview and editing feedback</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-2xl font-bold">4 Exports</p>
                <p className="text-sm text-muted-foreground">PNG, SVG, PDF, JSON</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-200/70 bg-white/90 p-5 shadow-sm md:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Preview</p>
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>System: Online Shop</span>
                <span>Auto-layout</span>
              </div>
              <div className="mt-4 rounded-xl border border-border bg-white p-3">
                <img
                  src="/use-case-diagram.svg"
                  alt="Use case UML diagram preview"
                  className="h-auto w-full animate-diagram-fade"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Preview updates as you edit actors, use cases, and relationships.
            </p>
            <Link
              href="/builder"
              className="mt-4 inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100"
            >
              Open interactive builder
            </Link>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-8xl px-6 py-8 md:px-10 md:py-12">
        <div className="rounded-3xl border border-emerald-200 bg-white/90 p-8 md:p-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How It Actually Works</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Real workflow inside this tool, from first input to final export.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <p className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-white">
                  {index + 1}
                </p>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-6 py-4 md:px-10">
        <div className="rounded-3xl border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-violet-50 p-8 md:p-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Discover Better Diagram Structures</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
            Your first output is a starting point. Refine repeatedly to explore alternative include/extend suggestions
            and improve structural quality before final export.
          </p>
          <Link
            href="/builder"
            className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Open Builder
          </Link>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-8xl px-6 py-8 md:px-10 md:py-12">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Powerful Features for Professional UML Work</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {features.map((item, index) => (
            <article
              key={item.title}
              className={`rounded-2xl border p-6 ${
                index % 4 === 0
                  ? "border-cyan-200 bg-cyan-50/70"
                  : index % 4 === 1
                    ? "border-violet-200 bg-violet-50/70"
                    : index % 4 === 2
                      ? "border-emerald-200 bg-emerald-50/70"
                      : "border-amber-200 bg-amber-50/70"
              }`}
            >
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-6 pb-20 pt-2 md:px-10">
        <div className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-100 to-indigo-100 p-8 text-center md:p-12">
          <p className="text-sm font-medium text-muted-foreground">Ready to model your next system?</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Start Creating Your Use Case Diagram</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Stop fighting layout tools. Focus on system thinking, refine relationships, and export final visuals fast.
          </p>
          <Link
            href="/builder"
            className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Start Creating Now
          </Link>
        </div>
      </section>

    </main>
  );
}
