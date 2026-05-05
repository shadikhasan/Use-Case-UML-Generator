import type { Metadata } from "next";
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
  return <UseCaseUMLBuilder />;
}
