"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AiPanel } from "@/components/ai-panel";
import { readSession, useStore } from "@/lib/store";

const tabs = [
  { href: "/inicio", label: "Inicio", icon: "M4 11.2 12 4l8 7.2M7 10.2V20h10v-9.8" },
  { href: "/explorar", label: "Explorar", icon: "M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M16.5 16.5 20 20" },
  { href: "/inspiracion", label: "Inspiración", icon: "M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM10.5 9.5v5l4-2.5z" },
  { href: "/citas", label: "Citas", icon: "M3.5 5h17v15.5a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V5zM3.5 10h17M8 3v4M16 3v4" },
  { href: "/perfil", label: "Perfil", icon: "M12 8m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 20.5c1.5-4 4.5-6 8-6s6.5 2 8 6" },
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
    <div className="relative min-h-dvh overflow-hidden bg-paper text-ink">
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="relative z-[1] mx-auto flex min-h-dvh w-full max-w-[390px] flex-col">
        <header
          className="flex items-center justify-between gap-4 px-5 pt-4"
          style={{ viewTransitionName: "client-header" }}
        >
          <p className="marca text-[15px]">IMAGO</p>
          <button type="button" onClick={() => setAi(true)} className="orbe" aria-label="Asistente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5 13.7 8.5 18.7 10.2 13.7 11.9 12 16.9 10.3 11.9 5.3 10.2 10.3 8.5z" />
              <path d="m18.5 15.5.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
            </svg>
          </button>
        </header>
        <div className="flex-1 pb-28">{children}</div>
        <nav
          aria-label="Secciones"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto grid w-full max-w-[390px] grid-cols-5 border-t border-line bg-glass px-2 pb-[max(18px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl"
          style={{ viewTransitionName: "client-nav" }}
        >
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                transitionTypes={["nav-fade"]}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-1 pt-1.5 text-[10.5px] font-semibold leading-none ${
                  active ? "text-ink" : "text-faint"
                }`}
              >
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
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
    <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/55">
      <button type="button" className="absolute inset-0" aria-label="Cerrar asistente" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[86dvh] w-full max-w-[390px] overflow-auto rounded-t-[30px] border-t border-line bg-paper px-5 pb-6 pt-3"
      >
        <div className="mx-auto mb-3 h-[5px] w-[38px] rounded-full bg-white/20" aria-hidden="true" />
        <div className="mb-4 flex items-center gap-3 border-b border-line pb-3">
          <span className="orbe" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 3.5 13.7 8.5 18.7 10.2 13.7 11.9 12 16.9 10.3 11.9 5.3 10.2 10.3 8.5z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold">Imago</h2>
            <p className="text-xs text-moss">Tu asistente · responde al momento</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <AiPanel mode="cliente" />
      </div>
    </div>
  );
}
