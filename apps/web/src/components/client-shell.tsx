"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AiPanel } from "@/components/ai-panel";
import { readSession, useStore } from "@/lib/store";

const tabs = [
  { href: "/inicio", label: "Inicio" },
  { href: "/explorar", label: "Explorar" },
  { href: "/inspiracion", label: "Inspiración" },
  { href: "/citas", label: "Citas" },
  { href: "/perfil", label: "Perfil" },
];

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useStore();
  const [ai, setAi] = useState(false);

  useEffect(() => {
    if (!readSession()) router.replace("/");
  }, [session, router]);

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-paper">
        <header
          className="flex items-center justify-between gap-4 px-5 pt-5"
          style={{ viewTransitionName: "client-header" }}
        >
          <p className="font-serif text-lg tracking-[0.22em]">IMAGO</p>
          <button
            type="button"
            onClick={() => setAi(true)}
            className="min-h-11 shrink-0 px-1 text-sm"
          >
            Asistente
          </button>
        </header>
        <div className="flex-1 pb-24">{children}</div>
        <nav
          aria-label="Secciones"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto grid w-full max-w-[480px] grid-cols-5 border-t border-line bg-paper"
          style={{ viewTransitionName: "client-nav" }}
        >
            {tabs.map((tab) => {
              const active =
                pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  transitionTypes={["nav-fade"]}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 items-center justify-center px-1 text-center text-xs leading-4 ${
                    active ? "font-medium text-ink" : "text-mute"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
        </nav>
      </div>
      {ai ? <Assistant onClose={() => setAi(false)} /> : null}
    </div>
  );
}

function Assistant({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement;
    panelRef.current?.querySelector<HTMLElement>("button, a, input")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [onClose]);

  return (
    <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Cerrar asistente" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[86dvh] w-full max-w-[480px] overflow-auto rounded-t-3xl bg-card p-5 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={titleId} className="font-serif text-3xl">
            Asistente
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 shrink-0 px-1 text-sm">
            Cerrar
          </button>
        </div>
        <AiPanel mode="cliente" />
      </div>
    </div>
  );
}
