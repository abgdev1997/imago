"use client";

import Link from "next/link";
import { useState } from "react";
import { BUSINESS_ID, clientById, serviceById } from "@/lib/data";
import { STATUS_LABEL, formatLong, money } from "@/lib/format";
import { clientStats, isFirst } from "@/lib/schedule";
import { useStore } from "@/lib/store";

export function ClientFile({ id }: { id: string }) {
  const client = clientById(id);
  const store = useStore();
  const [note, setNote] = useState(client ? store.notes[client.id] ?? client.about : "");
  if (!client) return <p className="p-6">No está en la agenda.</p>;

  const stats = clientStats(client.id, BUSINESS_ID, store.appointments);
  const first = isFirst(client.id, BUSINESS_ID, store.appointments);
  const blocked = store.blockedIds.includes(client.id);
  const history = store.appointments
    .filter((appointment) => appointment.clientId === client.id && appointment.businessId === BUSINESS_ID)
    .sort((a, b) => (a.start < b.start ? 1 : -1));

  return (
    <div className="px-4 py-6 md:px-8">
      <Link href="/business/clientes" transitionTypes={["nav-back"]} className="inline-flex min-h-11 items-center text-sm text-mute">Volver a clientes</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">{client.name}</h1>
          <p className="text-sm text-mute">{client.phone || "Sin teléfono"} · {client.email || "Sin email"}</p>
        </div>
        <div className="flex gap-2 text-xs">
          {first ? <span className="rounded-full bg-copper px-3 py-1 text-white">FIRST</span> : <span className="rounded-full bg-moss/15 px-3 py-1 text-moss">Ya viene</span>}
          <span className="rounded-full bg-card px-3 py-1 ring-1 ring-line">Confianza {client.trust}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat label="Visitas" value={String(stats.visits)} />
        <Stat label="Gasto" value={money(stats.spent)} />
        <Stat label="Ausencias" value={String(stats.absences)} />
        <Stat label="Última" value={stats.last ? formatLong(stats.last) : "—"} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-card p-4 ring-1 ring-line">
          <h2 className="font-serif text-2xl">Notas</h2>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-line bg-paper p-3 text-sm outline-none" />
          <button type="button" onClick={() => store.setNote(client.id, note)} className="mt-2 text-sm text-copper">
            Guardar nota
          </button>
        </section>
        <section className="rounded-3xl bg-card p-4 ring-1 ring-line">
          <h2 className="font-serif text-2xl">Ficha técnica</h2>
          <p className="mt-2 text-sm leading-6">Largo a la mandíbula, textura gruesa. Foto de antes y después se guardarían aquí, junto al consentimiento de color firmado el 12 jun 2026.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="grid h-24 place-items-center rounded-2xl bg-paper text-xs text-mute">Antes</div>
            <div className="grid h-24 place-items-center rounded-2xl bg-paper text-xs text-mute">Después</div>
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-line">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Historial</h2>
          <button type="button" onClick={() => store.toggleBlocked(client.id)} className="text-sm text-copper">
            {blocked ? "Desbloquear" : "Bloquear"}
          </button>
        </div>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {history.map((appointment) => (
            <li key={appointment.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-2">
              <span>{formatLong(appointment.start.slice(0, 10))} · {serviceById(appointment.serviceId)?.name}</span>
              <span className="text-mute">{STATUS_LABEL[appointment.status]} · {money(appointment.amount)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-card p-4 ring-1 ring-line">
      <p className="text-xs uppercase tracking-[0.14em] text-mute">{label}</p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
    </div>
  );
}
