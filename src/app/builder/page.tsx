import type { Metadata } from "next";
import UseCaseUMLBuilder from "@/components/UseCaseUMLBuilder";
import SiteNavbar from "@/components/SiteNavbar";

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
      <SiteNavbar currentPath="/builder" />
      <section className="mx-auto max-w-8xl px-6 md:px-10">
        <UseCaseUMLBuilder />
      </section>
    </main>
  );
}
