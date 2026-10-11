"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CURRENT_CLIENT,
  businessById,
  proById,
  serviceById,
} from "@/lib/data";
import {
  STATUS_LABEL,
  TODAY,
  beforeDeadline,
  formatLong,
  money,
} from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Appointment } from "@/lib/types";

export function Citas() {
  const { appointments, setStatus, notify, waitlist } = useStore();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const mine = appointments
    .filter((appointment) => appointment.clientId === CURRENT_CLIENT)
    .sort((a, b) => (a.start < b.start ? 1 : -1));
  const upcoming = mine.filter(
    (appointment) =>
      appointment.start.slice(0, 10) >= TODAY &&
      ["confirmada", "pendiente_pago", "en_curso", "cambiada"].includes(appointment.status),
  );
  const past = mine.filter((appointment) => !upcoming.includes(appointment));
  const target = mine.find((appointment) => appointment.id === cancelId);

  function cancel(appointment: Appointment) {
    const free = beforeDeadline(appointment.start, 12);
    setStatus(appointment.id, "cancelada");
    const waiting = waitlist.find(
      (item) =>
        item.businessId === appointment.businessId &&
        item.date === appointment.start.slice(0, 10) &&
        item.status === "esperando",
    );
    notify(
      free
        ? waiting
          ? "Cita cancelada sin coste. Avisamos al primero de la lista de espera."
          : "Cita cancelada sin coste. El hueco vuelve a la agenda."
        : "Cita cancelada. Como faltaban menos de 12 h, se queda la señal.",
    );
    setCancelId(null);
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="font-serif text-4xl">Citas</h1>
      <h2 className="mt-5 font-serif text-2xl">Próximas</h2>
      <div className="mt-3 flex flex-col gap-3">
        {upcoming.length === 0 ? <p className="text-sm text-mute">No tienes citas por delante.</p> : null}
        {upcoming.map((appointment) => (
          <Card key={appointment.id} appointment={appointment} onCancel={() => setCancelId(appointment.id)} />
        ))}
      </div>
      <h2 className="mt-6 font-serif text-2xl">Anteriores</h2>
      <div className="mt-3 flex flex-col gap-3">
        {past.map((appointment) => (
          <Card key={appointment.id} appointment={appointment} />
        ))}
      </div>
      {target ? (
        <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-ink/50">
          <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-5">
            <h2 className="font-serif text-3xl">Cancelar</h2>
            <p className="mt-2 text-sm leading-6">
              {beforeDeadline(target.start, 12)
                ? "Estás a tiempo: puedes cancelar sin coste."
                : `Faltan menos de 12 horas. Si cancelas, se queda la señal de ${money(10)}.`}
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setCancelId(null)} className="flex-1 rounded-full border border-line py-3 text-sm">
                Volver
              </button>
              <button type="button" onClick={() => cancel(target)} className="flex-1 rounded-full bg-copper py-3 text-sm text-white">
                Cancelar cita
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Card({
  appointment,
  onCancel,
}: {
  appointment: Appointment;
  onCancel?: () => void;
}) {
  const business = businessById(appointment.businessId);
  const service = serviceById(appointment.serviceId);
  const pro = proById(appointment.professionalId);
  const upcoming = Boolean(onCancel);
  const canChange = beforeDeadline(appointment.start, 6);

  return (
    <article className="rounded-3xl bg-card p-4 ring-1 ring-line">
      <p className="text-xs uppercase tracking-[0.14em] text-mute">{STATUS_LABEL[appointment.status]}</p>
      <h3 className="mt-1 font-medium">{service?.name}</h3>
      <p className="text-sm text-mute">
        {formatLong(appointment.start.slice(0, 10))} · {appointment.start.slice(11, 16)}
      </p>
      <p className="text-sm">{pro?.name} · {business?.name}</p>
      {upcoming ? (
        <div className="mt-4 flex flex-col gap-1 text-sm">
          {canChange ? (
            <Link
              href={`/reservar/${appointment.businessId}?cita=${appointment.id}&servicio=${appointment.serviceId}&pro=${appointment.professionalId}`}
              transitionTypes={["nav-forward"]}
              className="flex min-h-11 items-center"
            >
              Cambiar hora
            </Link>
          ) : (
            <p className="py-2 text-mute">Fuera de plazo para cambiar</p>
          )}
          <button type="button" onClick={onCancel} className="min-h-11 text-left">
            Cancelar
          </button>
          <a
            className="flex min-h-11 items-center"
            href={`https://maps.google.com/?q=${encodeURIComponent(`${business?.address ?? ""} ${business?.city ?? ""}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Cómo llegar
          </a>
        </div>
      ) : appointment.status === "completada" ? (
        <Link
          href={`/reservar/${appointment.businessId}?servicio=${appointment.serviceId}&pro=${appointment.professionalId}`}
          transitionTypes={["nav-forward"]}
          className="mt-3 inline-flex min-h-11 items-center text-sm text-copper"
        >
          Reservar de nuevo
        </Link>
      ) : null}
    </article>
  );
}
