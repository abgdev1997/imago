"use client";

import { proById, worksOf } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useState } from "react";

export function Inspiration() {
  const { savedWorks, toggleSaved, favorites } = useStore();
  const [sent, setSent] = useState<string | null>(null);
  const stories = worksOf().filter((work) => favorites.includes(work.businessId));

  return (
    <div className="px-5 pt-6">
      <h1 className="font-serif text-4xl">Inspiración</h1>
      <p className="mt-2 text-sm leading-6 text-mute">
        Trabajos de los estudios. Puedes guardar o enviar. En la app real pasarían una moderación antes de publicarse.
      </p>
      <div className="mt-4 flex gap-3 overflow-auto pb-1">
        {stories.map((work) => {
          const pro = proById(work.professionalId);
          return (
            <div key={work.id} className="w-16 shrink-0 text-center">
              <div className="mx-auto h-16 w-16 rounded-full ring-2 ring-copper" style={{ background: work.tone }} />
              <p className="mt-1 truncate text-[11px] text-mute">{pro?.name.split(" ")[0]}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 columns-2 gap-3">
        {worksOf().map((work) => {
          const pro = proById(work.professionalId);
          const saved = savedWorks.includes(work.id);
          return (
            <article key={work.id} className="mb-3 break-inside-avoid overflow-hidden rounded-3xl bg-card ring-1 ring-line">
              <div className="relative h-44" style={{ background: work.tone }}>
                <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2 py-1 text-[11px]">
                  {work.kind === "reel" ? "Reel" : "Foto"}
                </span>
              </div>
              <div className="p-3">
                <p className="font-medium">{work.title}</p>
                <p className="text-sm text-mute">{work.caption}</p>
                <p className="mt-1 text-xs text-mute">{pro?.name}</p>
                <div className="mt-1 flex flex-col text-sm">
                  <button type="button" onClick={() => toggleSaved(work.id)} className="min-h-11 text-left">
                    {saved ? "Guardado" : "Guardar"}
                  </button>
                  <button type="button" onClick={() => setSent(work.title)} className="min-h-11 text-left text-mute">
                    Enviar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {sent ? (
        <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-ink/50">
          <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-5">
            <h2 className="font-serif text-3xl">Enviar</h2>
            <p className="mt-2 text-sm leading-6">«{sent}» se enviaría a un contacto. En la maqueta el envío se queda aquí.</p>
            <button type="button" onClick={() => setSent(null)} className="mt-4 w-full rounded-full bg-ink py-3 text-sm text-paper">
              Listo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
