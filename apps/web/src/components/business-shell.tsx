"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/business", label: "Calendario" },
  { href: "/business/clientes", label: "Clientes" },
  { href: "/business/asistente", label: "Asistente" },
  { href: "/business/caja", label: "Caja" },
  { href: "/business/ajustes", label: "Ajustes" },
];

function active(pathname: string, href: string) {
  if (href === "/business") return pathname === "/business";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BusinessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-canvas text-ink md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-card px-5 py-7 md:flex">
        <Link href="/business" className="marca text-2xl">
          IMAGO
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-mute">Business</p>
        <p className="mt-4 text-sm">Sublime Barber Studio</p>
        <p className="text-sm text-mute">Javi Navarro · propietario</p>
        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              transitionTypes={["nav-fade"]}
              className={`flex min-h-11 items-center rounded-2xl px-3 text-sm ${
                active(pathname, link.href) ? "bg-ink text-paper" : "hover:bg-paper"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/inicio" transitionTypes={["nav-fade"]} className="mt-auto pt-8 text-sm text-copper">
          Abrir la app de clientes
        </Link>
      </aside>
      <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>
      <nav
        aria-label="Negocio"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-glass backdrop-blur-2xl md:hidden"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            transitionTypes={["nav-fade"]}
            aria-current={active(pathname, link.href) ? "page" : undefined}
            className={`flex min-h-14 items-center justify-center px-1 text-center text-xs leading-4 ${
              active(pathname, link.href) ? "font-medium text-ink" : "text-mute"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
