"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BUSINESS_ID,
  clientById,
  proById,
  prosOf,
  serviceById,
  servicesOf,
} from "@/lib/data";
import {
  STATUS_LABEL,
  addDays,
  formatLong,
  labelFromMinutes,
  minutes,
  monthCells,
  money,
} from "@/lib/format";
import {
  CLOSE,
  OPEN,
  STEP,
  isFirst,
  occupancy,
  slowDays,
  startTimes,
  weekDays,
} from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const ROW = 42;

export function Calendar() {
  const store = useStore();
  const [mode, setMode] = useState<"dia" | "semana" | "mes">("dia");
  const [date, setDate] = useState("2026-10-12");
  const [proFilter, setProFilter] = useState("todos");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showWait, setShowWait] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [freeSlot, setFreeSlot] = useState<number | null>(null);

  const pros = prosOf(BUSINESS_ID).filter((pro) => proFilter === "todos" || pro.id === proFilter);
  const visible = store.appointments.filter((appointment) => {
    if (appointment.businessId !== BUSINESS_ID) return false;
    if (appointment.status === "cancelada" || appointment.status === "cambiada") return false;
    if (proFilter !== "todos" && appointment.professionalId !== proFilter) return false;
    return true;
  });
  const dayItems = visible.filter((appointment) => appointment.start.startsWith(date));
  const percent = occupancy(BUSINESS_ID, date, store.appointments);
  const week = weekDays(date);
  const weekAverage = Math.round(
    week
      .map((day) => occupancy(BUSINESS_ID, day, store.appointments))
      .filter((value): value is number => value !== null)
      .reduce((sum, value, _, list) => sum + value / list.length, 0),
  );
  const slow = slowDays(BUSINESS_ID, "2026-10-11", store.appointments, 40);
  const waiting = store.waitlist.filter((item) => item.businessId === BUSINESS_ID && item.status === "esperando");
  const openings = useMemo(
    () =>
      startTimes({
        businessId: BUSINESS_ID,
        date,
        duration: 30,
        appointments: store.appointments,
        proId: proFilter === "todos" ? undefined : proFilter,
      }),
    [date, proFilter, store.appointments],
  );

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-mute">Agenda</p>
          <h1 className="font-serif text-4xl">{formatLong(date)}</h1>
          <p className="mt-1 text-sm text-mute">
            Ocupación del día {percent ?? "—"}% · semana {Number.isFinite(weekAverage) ? weekAverage : "—"}%
          </p>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={() => setShowNotes(true)} className="min-h-11 text-sm">
            Avisos
          </button>
          <button type="button" onClick={() => setShowWait(true)} className="min-h-11 text-sm">
            Espera ({waiting.length})
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Vista de la agenda">
        {(["dia", "semana", "mes"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={mode === item}
            onClick={() => setMode(item)}
            className={`min-h-11 rounded-2xl text-sm capitalize ${mode === item ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button type="button" onClick={() => setDate(addDays(date, mode === "mes" ? -30 : mode === "semana" ? -7 : -1))} className="min-h-11 rounded-2xl bg-card text-sm ring-1 ring-line">
          Anterior
        </button>
        <button type="button" onClick={() => setDate("2026-10-12")} className="min-h-11 rounded-2xl bg-card text-sm ring-1 ring-line">
          Lunes 12
        </button>
        <button type="button" onClick={() => setDate(addDays(date, mode === "mes" ? 30 : mode === "semana" ? 7 : 1))} className="min-h-11 rounded-2xl bg-card text-sm ring-1 ring-line">
          Siguiente
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto">
        <Filter active={proFilter === "todos"} onClick={() => setProFilter("todos")} label="Todos" />
        {prosOf(BUSINESS_ID).map((pro) => (
          <Filter key={pro.id} active={proFilter === pro.id} onClick={() => setProFilter(pro.id)} label={pro.name.split(" ")[0]} />
        ))}
      </div>

      {slow.length > 0 && !store.offer ? (
        <button
          type="button"
          onClick={() => {
            const day = slow[0];
            store.publishOffer({
              businessId: BUSINESS_ID,
              date: day.date,
              from: "16:00",
              to: "19:00",
              discount: 15,
              note: `−15% en Sublime el ${formatLong(day.date)}, de 16:00 a 19:00`,
            });
            store.notify("Oferta publicada. Lucía ya la ve en Inicio.");
          }}
          className="mt-4 w-full rounded-3xl bg-card px-4 py-3 text-left text-sm ring-1 ring-line"
        >
          {slow.map((day) => `${day.date.slice(8)} oct al ${day.percent}%`).join(" · ")}. Preparar una oferta del 15%.
        </button>
      ) : null}
      {store.offer ? (
        <p className="mt-4 rounded-3xl bg-moss/10 px-4 py-3 text-sm text-moss">
          Oferta activa: {store.offer.note}
        </p>
      ) : null}

      {mode === "dia" ? (
        <div className="mt-4 overflow-hidden rounded-3xl bg-card ring-1 ring-line">
          <div className="grid border-b border-line text-xs" style={{ gridTemplateColumns: `48px repeat(${pros.length}, 1fr)` }}>
            <span />
            {pros.map((pro) => (
              <span key={pro.id} className="px-2 py-2 font-medium">{pro.name.split(" ")[0]}</span>
            ))}
          </div>
          <div className="max-h-[640px] overflow-auto">
            <div className="grid" style={{ gridTemplateColumns: `48px repeat(${pros.length}, 1fr)` }}>
              <div>
                {Array.from({ length: (CLOSE - OPEN) / 60 }, (_, index) => (
                  <div key={index} className="pr-1 text-right text-[11px] text-mute" style={{ height: ROW * 2 }}>
                    {10 + index}:00
                  </div>
                ))}
              </div>
              {pros.map((pro) => (
                <div key={pro.id} className="relative border-l border-line" style={{ height: ((CLOSE - OPEN) / STEP) * ROW }}>
                  {dayItems
                    .filter((appointment) => appointment.professionalId === pro.id)
                    .map((appointment) => {
                      const start = minutes(appointment.start.slice(11, 16));
                      const client = clientById(appointment.clientId);
                      const first = isFirst(appointment.clientId, BUSINESS_ID, store.appointments);
                      return (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => setSelected(appointment)}
                          className="absolute inset-x-1 overflow-hidden rounded-xl px-2 py-1 text-left text-white"
                          style={{
                            top: ((start - OPEN) / STEP) * ROW + 2,
                            height: Math.max(28, (appointment.duration / STEP) * ROW - 4),
                            background: pro.color,
                          }}
                        >
                          <span className="block text-[11px]">{appointment.start.slice(11, 16)} {client?.name}</span>
                          <span className="block text-[11px] opacity-80">{serviceById(appointment.serviceId)?.name}</span>
                          {first ? <span className="text-[10px]">FIRST</span> : null}
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {mode === "semana" ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-7">
          {week.map((day) => {
            const value = occupancy(BUSINESS_ID, day, store.appointments);
            const count = visible.filter((appointment) => appointment.start.startsWith(day)).length;
            return (
              <button key={day} type="button" onClick={() => { setDate(day); setMode("dia"); }} className="rounded-3xl bg-card p-3 text-left ring-1 ring-line">
                <p className="text-xs text-mute">{formatLong(day).split(",")[0] || formatLong(day).split(" ")[0]}</p>
                <p className="font-serif text-3xl">{Number(day.slice(8))}</p>
                <p className="text-sm">{value === null ? "Cerrado" : `${value}%`}</p>
                <p className="text-xs text-mute">{count} citas</p>
              </button>
            );
          })}
        </div>
      ) : null}

      {mode === "mes" ? (
        <div className="mt-4 grid grid-cols-7 gap-1">
          {monthCells(2026, Number(date.slice(5, 7))).map((cell, index) => {
            if (!cell) return <span key={`e-${index}`} />;
            const value = occupancy(BUSINESS_ID, cell, store.appointments);
            return (
              <button key={cell} type="button" onClick={() => { setDate(cell); setMode("dia"); }} className="h-16 rounded-2xl bg-card text-sm ring-1 ring-line">
                <span className="block">{Number(cell.slice(8))}</span>
                <span className="text-[11px] text-mute">{value === null ? "—" : `${value}%`}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {mode === "dia" ? (
        <div className="mt-4">
          <p className="text-sm text-mute">Huecos de 30 min</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {openings.length === 0 ? <span className="text-sm">No queda ninguno.</span> : null}
            {openings.slice(0, 12).map((slot) => (
              <button key={slot} type="button" onClick={() => setFreeSlot(slot)} className="rounded-full bg-card px-3 py-1.5 text-sm ring-1 ring-line">
                {labelFromMinutes(slot)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selected ? (
        <Drawer title="Cita" onClose={() => setSelected(null)}>
          <AppointmentDetail
            appointment={selected}
            onStatus={(status) => {
              store.setStatus(selected.id, status);
              setSelected({ ...selected, status });
              store.notify(`Estado: ${STATUS_LABEL[status]}.`);
            }}
          />
        </Drawer>
      ) : null}

      {showWait ? (
        <Drawer title="Lista de espera" onClose={() => setShowWait(false)}>
          <ul className="flex flex-col gap-2 text-sm">
            {waiting.map((item) => (
              <li key={item.id} className="rounded-2xl bg-paper p-3">
                {clientById(item.clientId)?.name} · {formatLong(item.date)} · {item.band}
              </li>
            ))}
            {waiting.length === 0 ? <li>Nadie en espera.</li> : null}
          </ul>
        </Drawer>
      ) : null}

      {showNotes ? (
        <Drawer title="Avisos del estudio" onClose={() => setShowNotes(false)}>
          <ul className="flex flex-col gap-2 text-sm leading-6">
            <li className="rounded-2xl bg-paper p-3">Hugo Paredes entra el lunes a las 10:00. Es FIRST: no tiene ninguna cita completada.</li>
            <li className="rounded-2xl bg-paper p-3">El sábado 17 hay {waiting.filter((item) => item.date === "2026-10-17").length} personas esperando un hueco.</li>
            <li className="rounded-2xl bg-paper p-3">Inés está fuera del 20 al 24. Esas horas no se ofrecen.</li>
          </ul>
        </Drawer>
      ) : null}

      {freeSlot !== null ? (
        <ManualBooking
          date={date}
          start={freeSlot}
          proFilter={proFilter}
          onClose={() => setFreeSlot(null)}
        />
      ) : null}
    </div>
  );
}

function Filter({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-11 shrink-0 rounded-full px-4 text-sm ${active ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}>
      {label}
    </button>
  );
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="ios-backdrop fixed inset-0 z-50 flex justify-end bg-ink/40">
      <button type="button" className="hidden flex-1 sm:block" aria-label="Cerrar" onClick={onClose} />
      <div className="h-full w-full max-w-md overflow-auto bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-mute">Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppointmentDetail({
  appointment,
  onStatus,
}: {
  appointment: Appointment;
  onStatus: (status: AppointmentStatus) => void;
}) {
  const client = clientById(appointment.clientId);
  const pro = proById(appointment.professionalId);
  const service = serviceById(appointment.serviceId);
  const store = useStore();
  const first = client ? isFirst(client.id, BUSINESS_ID, store.appointments) : false;
  return (
    <div className="text-sm leading-6">
      <p className="font-medium">{client?.name}</p>
      {first ? <p className="text-copper">FIRST · primera cita sin completar</p> : null}
      <p>{service?.name} · {pro?.name}</p>
      <p>{formatLong(appointment.start.slice(0, 10))} · {appointment.start.slice(11, 16)} · {appointment.duration} min</p>
      <p>{STATUS_LABEL[appointment.status]} · {money(appointment.amount)} · {appointment.payment}</p>
      {client?.primary ? (
        <Link href={`/business/clientes/${client.id}`} transitionTypes={["nav-forward"]} className="mt-2 inline-flex min-h-11 items-center text-copper">Abrir ficha</Link>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onStatus("en_curso")} className="rounded-full border border-line py-2">En curso</button>
        <button type="button" onClick={() => onStatus("completada")} className="rounded-full border border-line py-2">Completada</button>
        <button type="button" onClick={() => onStatus("no_vino")} className="rounded-full border border-line py-2">No vino</button>
        <button type="button" onClick={() => onStatus("cancelada")} className="rounded-full bg-copper py-2 text-white">Cancelar</button>
      </div>
    </div>
  );
}

function ManualBooking({
  date,
  start,
  proFilter,
  onClose,
}: {
  date: string;
  start: number;
  proFilter: string;
  onClose: () => void;
}) {
  const store = useStore();
  const [clientId, setClientId] = useState("andres");
  const [serviceId, setServiceId] = useState("corte");
  const [proId, setProId] = useState(proFilter === "todos" ? "marcos" : proFilter);
  const options = servicesOf(BUSINESS_ID).filter((service) => service.proIds.includes(proId));

  return (
    <Drawer title="Hueco libre" onClose={onClose}>
      <p className="text-sm">{formatLong(date)} · {labelFromMinutes(start)}</p>
      <label className="mt-3 block text-sm">
        Cliente
        <select value={clientId} onChange={(event) => setClientId(event.target.value)} className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2">
          {["lucia", "hugo", "marta", "andres", "elena"].map((id) => (
            <option key={id} value={id}>{clientById(id)?.name}</option>
          ))}
        </select>
      </label>
      <label className="mt-3 block text-sm">
        Profesional
        <select value={proId} onChange={(event) => setProId(event.target.value)} className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2">
          {prosOf(BUSINESS_ID).map((pro) => (
            <option key={pro.id} value={pro.id}>{pro.name}</option>
          ))}
        </select>
      </label>
      <label className="mt-3 block text-sm">
        Servicio
        <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2">
          {options.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="mt-4 w-full rounded-full bg-ink py-3 text-sm text-paper"
        onClick={() => {
          const service = options.find((item) => item.id === serviceId) ?? options[0];
          if (!service) return;
          store.book({
            id: `manual-${Date.now()}`,
            businessId: BUSINESS_ID,
            professionalId: proId,
            serviceId,
            clientId,
            start: `${date}T${labelFromMinutes(start)}`,
            duration: service.duration,
            status: "confirmada",
            payment: "local",
            amount: service.price,
            origin: "manual",
          });
          store.notify("Cita creada a mano. Lucía la verá si es suya.");
          onClose();
        }}
      >
        Crear cita
      </button>
    </Drawer>
  );
}
