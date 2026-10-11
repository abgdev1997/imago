"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { businesses, categories, clientById, CURRENT_CLIENT } from "@/lib/data";
import { formatShort, money } from "@/lib/format";
import { affinity, slotFree } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { Category, Prefs } from "@/lib/types";

const values = [
  { id: "rapidez", label: "Rapidez" },
  { id: "atencion", label: "Atención" },
  { id: "precio", label: "Precio" },
  { id: "valoracion", label: "Valoración" },
] as const;

const distances = [
  { id: "cerca", label: "Cerca de mí" },
  { id: "da-igual", label: "Me da igual" },
  { id: "lejos", label: "Me desplazo" },
] as const;

export function Home() {
  const store = useStore();
  const [quiz, setQuiz] = useState(false);
  const [bell, setBell] = useState(false);
  const me = clientById(CURRENT_CLIENT);

  useEffect(() => {
    if (store.prefs || store.quizSnoozed) return;
    const timer = window.setTimeout(() => setQuiz(true), 1500);
    return () => window.clearTimeout(timer);
  }, [store.prefs, store.quizSnoozed]);

  const ranked = useMemo(
    () =>
      [...businesses].sort(
        (a, b) => affinity(b, store.prefs) - affinity(a, store.prefs),
      ),
    [store.prefs],
  );

  const dueFree = slotFree({
    businessId: "sublime",
    proId: "marcos",
    date: "2026-10-13",
    start: 18 * 60,
    duration: 30,
    appointments: store.appointments,
  });

  return (
    <div className="px-5 pt-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-mute">Domingo 11 de octubre</p>
          <h1 className="mt-1 font-serif text-4xl leading-tight">Hola, {me?.name.split(" ")[0]}</h1>
        </div>
        <button type="button" onClick={() => setBell(true)} className="min-h-11 shrink-0 text-sm">
          Avisos
        </button>
      </header>

      <Link
        href="/explorar"
        transitionTypes={["nav-fade"]}
        className="mt-5 flex items-center gap-3 rounded-full border border-line bg-card px-4 py-3 text-sm text-mute"
      >
        <span className="text-copper">Buscar</span>
        un estudio, un servicio o un barrio
      </Link>

      <div className="mt-4 flex gap-2 overflow-auto pb-1">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/explorar?cat=${encodeURIComponent(category)}`}
            transitionTypes={["nav-fade"]}
            className="shrink-0 rounded-full bg-card px-3 py-2 text-sm ring-1 ring-line"
          >
            {category}
          </Link>
        ))}
      </div>

      {dueFree ? (
        <section className="mt-5 rounded-[22px] bg-card p-4 ring-1 ring-line">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Ya te toca</p>
          <h2 className="mt-2 font-serif text-2xl leading-tight">El corte con Marcos</h2>
          <p className="mt-2 text-sm leading-6 text-mute">
            Tu última visita fue el 20 de septiembre. El martes 13 a las 18:00 sigue libre.
          </p>
          <Link
            href="/reservar/sublime?dia=2026-10-13&hora=18:00&servicio=corte&pro=marcos&paso=4"
            transitionTypes={["nav-forward"]}
            className="mt-4 inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper"
          >
            Reservar ese hueco
          </Link>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Favoritos</h2>
        <div className="mt-3 flex gap-3 overflow-auto pb-1">
          {ranked
            .filter((business) => store.favorites.includes(business.id))
            .map((business) => (
              <Link
                key={business.id}
                href={`/explorar/${business.id}`}
                transitionTypes={["nav-forward"]}
                className="w-40 shrink-0 overflow-hidden rounded-3xl bg-card ring-1 ring-line"
              >
                <div className="h-24" style={{ background: business.cover }} />
                <div className="p-3">
                  <p className="text-sm font-medium leading-5">{business.name}</p>
                  <p className="text-xs text-mute">{business.neighborhood}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Ofertas</h2>
        <div className="mt-3 flex flex-col gap-3">
          {store.offer ? (
            <article className="rounded-3xl bg-card p-4 ring-1 ring-line">
              <p className="text-xs uppercase tracking-[0.16em] text-copper">Día flojo</p>
              <p className="mt-1 font-medium">{store.offer.note}</p>
              <p className="text-sm text-mute">
                {formatShort(store.offer.date)} · {store.offer.from}–{store.offer.to} · −{store.offer.discount}%
              </p>
            </article>
          ) : (
            <article className="rounded-3xl bg-card p-4 ring-1 ring-line">
              <p className="text-xs uppercase tracking-[0.16em] text-copper">Atelier Luna</p>
              <p className="mt-1 font-medium">−15% en color, martes de 16:00 a 19:00</p>
              <p className="text-sm text-mute">Solo si el día sigue por debajo del 40%.</p>
            </article>
          )}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-2xl">
            {store.prefs ? "Para ti" : "Recomendados"}
          </h2>
          {store.prefs ? (
            <button type="button" onClick={() => setQuiz(true)} className="text-sm text-copper">
              Cambiar
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {ranked.map((business) => (
            <Link
              key={business.id}
              href={`/explorar/${business.id}`}
              transitionTypes={["nav-forward"]}
              className="flex gap-3 rounded-3xl bg-card p-3 ring-1 ring-line"
            >
              <div className="h-20 w-20 shrink-0 rounded-2xl" style={{ background: business.cover }} />
              <div className="min-w-0">
                <p className="font-medium">{business.name}</p>
                <p className="text-sm text-mute">
                  {business.category} · {business.distanceKm.toLocaleString("es-ES")} km · {business.rating}
                </p>
                <p className="mt-1 text-sm">Afinidad {affinity(business, store.prefs)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {quiz ? (
        <Quiz
          onClose={() => {
            store.snoozeQuiz();
            setQuiz(false);
          }}
          onSave={(prefs) => {
            store.savePrefs(prefs);
            setQuiz(false);
            store.notify("Guardamos tus preferencias. El inicio ya está ordenado.");
          }}
        />
      ) : null}

      {bell ? (
        <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/55">
          <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-3xl">Avisos</h2>
              <button type="button" onClick={() => setBell(false)} className="text-sm text-mute">
                Cerrar
              </button>
            </div>
            <ul className="flex flex-col gap-3 text-sm leading-6">
              <li className="rounded-2xl bg-paper p-3">Hoy a las 19:30 tienes barba con Marcos. Si cancelas ahora, se queda la señal de {money(10)}.</li>
              <li className="rounded-2xl bg-paper p-3">El jueves 15 a las 17:30 sigue confirmada. Te escribiremos por WhatsApp 24 h y 2 h antes.</li>
              <li className="rounded-2xl bg-paper p-3">Inés no está del 20 al 24. El color vuelve el lunes 26.</li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Quiz({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (prefs: Prefs) => void;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<Category>("Barbería");
  const [value, setValue] = useState<Prefs["value"]>("rapidez");
  const [distance, setDistance] = useState<Prefs["distance"]>("cerca");

  const title = ["¿Qué te apetece ahora?", "¿Qué pesa más?", "¿Hasta dónde te mueves?"][step];

  return (
    <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/55">
      <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-mute">Pregunta {step + 1} de 3</p>
        <h2 className="mt-1 font-serif text-3xl">{title}</h2>
        <div className="mt-4 flex flex-col gap-2">
          {step === 0
            ? categories.map((item) => (
                <Choice key={item} active={category === item} onClick={() => setCategory(item)} label={item} />
              ))
            : null}
          {step === 1
            ? values.map((item) => (
                <Choice key={item.id} active={value === item.id} onClick={() => setValue(item.id)} label={item.label} />
              ))
            : null}
          {step === 2
            ? distances.map((item) => (
                <Choice key={item.id} active={distance === item.id} onClick={() => setDistance(item.id)} label={item.label} />
              ))
            : null}
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-line py-3 text-sm">
            Ahora no
          </button>
          <button
            type="button"
            className="flex-1 rounded-full bg-ink py-3 text-sm text-paper"
            onClick={() => {
              if (step < 2) setStep(step + 1);
              else onSave({ category, value, distance });
            }}
          >
            {step < 2 ? "Siguiente" : "Ver recomendaciones"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Choice({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm ${
        active ? "border-ink bg-ink text-paper" : "border-line bg-paper"
      }`}
    >
      {label}
    </button>
  );
}
