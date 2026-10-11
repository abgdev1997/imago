"use client";

import Link from "next/link";
import { useState } from "react";
import {
  businessById,
  prosOf,
  reviewsOf,
  servicesOf,
  wallOf,
  worksOf,
} from "@/lib/data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

const tabs = ["Servicios", "Muro", "Equipo", "Trabajos", "Reseñas", "Info"] as const;

export function Ficha({ id }: { id: string }) {
  const business = businessById(id);
  const store = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Servicios");
  const [message, setMessage] = useState(false);
  const [gift, setGift] = useState(false);
  const [bonus, setBonus] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState([
    "Hola, ¿tenéis hueco el viernes por la tarde para un corte?",
  ]);
  const [code, setCode] = useState<string | null>(null);

  if (!business) {
    return <p className="p-6">No encontramos ese estudio.</p>;
  }

  const favorite = store.favorites.includes(business.id);

  return (
    <div>
      <div className="relative h-52" style={{ background: business.cover }}>
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
          <Link href="/explorar" transitionTypes={["nav-back"]} className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm">
            Volver
          </Link>
          <button
            type="button"
            onClick={() => setTrailer(true)}
            className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm"
          >
            Tráiler
          </button>
        </div>
      </div>
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-mute">{business.category}</p>
            <h1 className="font-serif text-3xl leading-tight">{business.name}</h1>
            <p className="mt-2 text-sm text-mute">
              {business.rating} · {business.reviewCount} reseñas · {business.distanceKm.toLocaleString("es-ES")} km
            </p>
          </div>
          <button
            type="button"
            onClick={() => store.toggleFavorite(business.id)}
            className="inline-flex min-h-11 shrink-0 items-center px-1 text-sm"
          >
            {favorite ? "Guardado" : "Guardar"}
          </button>
        </div>
        <p className="mt-3 text-sm leading-6">{business.blurb}</p>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <button type="button" onClick={() => setMessage(true)} className="min-h-11 text-left">
            Mensaje
          </button>
          <button type="button" onClick={() => setGift(true)} className="min-h-11 text-left">
            Regalar
          </button>
          <button type="button" onClick={() => setBonus(true)} className="min-h-11 text-left">
            Bonos y club
          </button>
        </div>
        <Link
          href={`/reservar/${business.id}`}
          transitionTypes={["nav-forward"]}
          className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-ink text-sm text-paper"
        >
          Reservar
        </Link>

        {wallOf(business.id)
          .filter((item) => item.pinned)
          .map((item) => (
            <p key={item.id} className="mt-4 rounded-2xl bg-card px-3 py-3 text-sm leading-6 ring-1 ring-line">
              Fijado · {item.text}
            </p>
          ))}

        <div className="mt-5 flex gap-2 overflow-auto">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                tab === item ? "bg-ink text-paper" : "bg-card ring-1 ring-line"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {tab === "Servicios"
            ? servicesOf(business.id).map((service) => (
                <article key={service.id} className="rounded-3xl bg-card p-4 ring-1 ring-line">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-medium">{service.name}</h2>
                    <span>{money(service.price)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-mute">{service.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-mute">
                    {service.duration} min{service.consent ? " · pide firma" : ""}
                  </p>
                </article>
              ))
            : null}
          {tab === "Muro"
            ? wallOf(business.id).map((item) => (
                <article key={item.id} className="rounded-3xl bg-card p-4 ring-1 ring-line">
                  <p className="text-xs text-mute">{item.author}</p>
                  <p className="mt-1 text-sm leading-6">{item.text}</p>
                </article>
              ))
            : null}
          {tab === "Equipo"
            ? prosOf(business.id).map((pro) => (
                <article key={pro.id} className="rounded-3xl bg-card p-4 ring-1 ring-line">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full text-sm text-white" style={{ background: pro.color }}>
                      {pro.name.slice(0, 1)}
                    </span>
                    <div>
                      <p className="font-medium">{pro.name}</p>
                      <p className="text-sm text-mute">{pro.title}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6">{pro.bio}</p>
                </article>
              ))
            : null}
          {tab === "Trabajos"
            ? worksOf(business.id).map((work) => (
                <article key={work.id} className="overflow-hidden rounded-3xl ring-1 ring-line">
                  <div className="h-40" style={{ background: work.tone }} />
                  <div className="bg-card p-4">
                    <p className="font-medium">{work.title}</p>
                    <p className="text-sm text-mute">{work.caption}</p>
                  </div>
                </article>
              ))
            : null}
          {tab === "Reseñas"
            ? reviewsOf(business.id).map((review) => (
                <article key={review.id} className="rounded-3xl bg-card p-4 ring-1 ring-line">
                  <p className="text-sm">{ "★".repeat(review.rating) }</p>
                  <p className="mt-1 text-sm leading-6">{review.text}</p>
                  <p className="mt-2 text-xs text-mute">{review.author}</p>
                </article>
              ))
            : null}
          {tab === "Info" ? (
            <article className="rounded-3xl bg-card p-4 text-sm leading-6 ring-1 ring-line">
              <p>{business.about}</p>
              <p className="mt-2">{business.address}, {business.city}</p>
              <p>{business.hours}</p>
              <p>{business.phone}</p>
              <p>{business.instagram}</p>
              <a
                className="mt-2 inline-block text-copper"
                href={`https://maps.google.com/?q=${encodeURIComponent(`${business.address} ${business.city}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                Cómo llegar
              </a>
            </article>
          ) : null}
        </div>
      </div>

      {message ? (
        <Sheet title="Mensaje" onClose={() => setMessage(false)}>
          <div className="flex flex-col gap-2">
            {thread.map((line, index) => (
              <p key={line + index} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${index % 2 === 0 ? "bg-ink text-paper" : "bg-paper"}`}>
                {line}
              </p>
            ))}
            {thread.length === 1 ? (
              <p className="max-w-[85%] rounded-2xl bg-paper px-3 py-2 text-sm">
                Hola Lucía. El viernes por la tarde Marcos tiene hueco. Si quieres, te lo dejo apartado desde Reservar.
              </p>
            ) : null}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              setThread((current) => [...current, draft.trim()]);
              setDraft("");
            }}
          >
            <input value={draft} onChange={(event) => setDraft(event.target.value)} className="min-w-0 flex-1 rounded-full border border-line px-3 py-2 text-sm outline-none" />
            <button type="submit" className="rounded-full bg-ink px-4 text-sm text-paper">Enviar</button>
          </form>
        </Sheet>
      ) : null}

      {gift ? (
        <Sheet title="Regalar" onClose={() => setGift(false)}>
          {code ? (
            <p className="text-sm leading-6">Tarjeta lista. Código <strong>{code}</strong>. En la maqueta no se cobra.</p>
          ) : (
            <form
              className="flex flex-col gap-3 text-sm"
              onSubmit={(event) => {
                event.preventDefault();
                setCode(`IMAGO-${business.id.slice(0, 3).toUpperCase()}-40`);
              }}
            >
              <Field label="De" name="de" defaultValue="Lucía" />
              <Field label="Para" name="para" defaultValue="Ana" />
              <Field label="Mensaje" name="mensaje" defaultValue="Para cuando quieras sentarte." />
              <button type="submit" className="rounded-full bg-ink py-3 text-paper">Crear tarjeta de {money(40)}</button>
            </form>
          )}
        </Sheet>
      ) : null}

      {bonus ? (
        <Sheet title="Bonos y club" onClose={() => setBonus(false)}>
          {business.id === "sublime" ? (
            <p className="text-sm leading-6">
              Tienes el bono de 5 cortes con {store.bonusLeft} usos. Se puede aplicar al confirmar un corte.
            </p>
          ) : (
            <p className="text-sm leading-6">Este estudio todavía no tiene un bono activo en la maqueta.</p>
          )}
        </Sheet>
      ) : null}

      {trailer ? (
        <Sheet title="Tráiler" onClose={() => setTrailer(false)}>
          <div className="grid h-48 place-items-center rounded-3xl text-paper" style={{ background: business.cover }}>
            <span className="rounded-full bg-paper/90 px-4 py-2 text-sm text-ink">0:18 · estudio</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-mute">Vídeo de muestra. En la app real lo serviría Cloudflare Stream o Mux.</p>
        </Sheet>
      ) : null}
    </div>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-ink/50">
      <div className="max-h-[86dvh] w-full max-w-[480px] overflow-auto rounded-t-3xl bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-mute">Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.14em] text-mute">{label}</span>
      <input name={name} defaultValue={defaultValue} className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2 outline-none" />
    </label>
  );
}
