import Link from "next/link";

type SiteNavbarProps = {
  currentPath: "/" | "/builder" | "/contact";
};

const links = [
  { href: "/", label: "Home" },
  { href: "/builder", label: "Builder" },
  { href: "/contact", label: "Contact" },
] as const;

export default function SiteNavbar({ currentPath }: SiteNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/45 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-6 py-3 md:px-10">
        <Link href="/" className="text-sm font-semibold tracking-wide text-sky-900">
          Use Case UML Generator
        </Link>

        <nav className="flex items-center gap-4 text-sm text-muted-foreground md:gap-5">
          {links.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "font-semibold text-foreground" : "hover:text-foreground"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
