"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  CURRENT_CLIENT,
  businessById,
  prosOf,
  serviceById,
  servicesOf,
} from "@/lib/data";
import {
  beforeDeadline,
  formatLong,
  labelFromMinutes,
  minutes,
  money,
  monthCells,
} from "@/lib/format";
import {
  dayTone,
  leastLoadedPro,
  onVacation,
  prosForService,
  slotFree,
  type DayTone,
} from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { Appointment, PayMethod } from "@/lib/types";

export function Booking({
  id,
  initial,
}: {
  id: string;
  initial: {
    date?: string;
    time?: string;
    serviceId?: string;
    proId?: string;
    cita?: string;
    paso?: string;
  };
}) {
  const business = businessById(id);
  const store = useStore();
  const seq = useRef(0);
  const [step, setStep] = useState(
    initial.paso === "4" && initial.date && initial.time && initial.serviceId ? 4 : 1,
  );
  const [cursor, setCursor] = useState(() =>
    initial.date
      ? { year: Number(initial.date.slice(0, 4)), month: Number(initial.date.slice(5, 7)) }
      : { year: 2026, month: 10 },
  );
  const [date, setDate] = useState<string | null>(initial.date ?? null);
  const [time, setTime] = useState<number | null>(initial.time ? minutes(initial.time) : null);
  const [serviceId, setServiceId] = useState<string | null>(initial.serviceId ?? null);
  const [proId, setProId] = useState(initial.proId ?? "any");
  const [pay, setPay] = useState<PayMethod>("local");
  const [signed, setSigned] = useState(false);
  const [paying, setPaying] = useState(false);
  const [band, setBand] = useState<"manana" | "tarde" | "cualquiera">("tarde");
  const [done, setDone] = useState<Appointment | null>(null);
  const [changeId] = useState<string | null>(initial.cita ?? null);

  const service = serviceId ? serviceById(serviceId) : undefined;
  const tone = date ? dayTone(id, date, store.appointments) : null;
  const times = useMemo(() => {
    if (!date || !business) return [];
    const duration = service?.duration ?? 30;
    const result: number[] = [];
    for (let start = 10 * 60; start + 30 <= 20 * 60; start += 30) {
      const free = prosOf(id).some((pro) =>
        slotFree({
          businessId: id,
          proId: pro.id,
          date,
          start,
          duration: Math.max(30, service && step > 1 ? duration : 30),
          appointments: store.appointments,
        }),
      );
      if (free) result.push(start);
    }
    return result;
  }, [date, business, id, service, step, store.appointments]);

  if (!business) return <p className="p-6">No encontramos ese estudio.</p>;

  const previous = store.appointments.find((item) => item.id === changeId);
  const canUseBonus = business.id === "sublime" && service?.id === "corte" && store.bonusLeft > 0;

  function commit(method: PayMethod) {
    if (!date || time === null || !service) return;
    const chosen =
      proId === "any"
        ? leastLoadedPro({
            businessId: id,
            serviceId: service.id,
            date,
            start: time,
            duration: service.duration,
            appointments: store.appointments,
          })
        : prosOf(id).find((pro) => pro.id === proId);
    if (!chosen) {
      store.notify("Esa hora ya no está libre para este servicio.");
      setStep(1);
      return;
    }
    const fits = slotFree({
      businessId: id,
      proId: chosen.id,
      date,
      start: time,
      duration: service.duration,
      appointments: store.appointments,
    });
    if (!fits) {
      store.notify("No cabe el servicio en esa hora. Elige otro hueco.");
      setStep(1);
      return;
    }
    if (previous && !beforeDeadline(previous.start, 6)) {
      store.notify("Esa cita ya no se puede cambiar: el plazo es de 6 horas.");
      return;
    }
    const appointment: Appointment = {
      id: `cita-${(seq.current += 1)}`,
      businessId: id,
      professionalId: chosen.id,
      serviceId: service.id,
      clientId: CURRENT_CLIENT,
      start: `${date}T${labelFromMinutes(time)}`,
      duration: service.duration,
      status: "confirmada",
      payment: method,
      amount: method === "bono" ? 0 : method === "senal" ? 10 : service.price,
      origin: "app",
    };
    if (previous) store.setStatus(previous.id, "cambiada");
    if (method === "bono") store.useBonus();
    store.book(appointment);
    store.notify("El estudio ya ve la cita en su agenda.");
    setDone(appointment);
    setPaying(false);
  }

  if (done) {
    const pro = prosOf(id).find((item) => item.id === done.professionalId);
    return (
      <div className="px-5 pt-10">
        <p className="text-xs uppercase tracking-[0.18em] text-copper">Cita confirmada</p>
        <h1 className="mt-2 font-serif text-5xl leading-none">Ya está.</h1>
        <p className="mt-4 text-sm leading-6">
          {serviceById(done.serviceId)?.name} con {pro?.name}, el {formatLong(done.start.slice(0, 10))} a las {done.start.slice(11, 16)}.
        </p>
        <p className="mt-2 text-sm leading-6 text-mute">
          Te escribiremos por WhatsApp 24 h y 2 h antes. Si no tienes WhatsApp, el aviso sale por SMS.
        </p>
        <Link href="/citas" transitionTypes={["nav-back"]} className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-ink text-sm text-paper">
          Ver mis citas
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 pt-5">
        <Link href={`/explorar/${id}`} transitionTypes={["nav-back"]} className="inline-flex min-h-11 items-center text-sm text-mute">
          Volver a {business.name}
        </Link>
        <h1 className="mt-2 font-serif text-4xl">Reservar</h1>
        <p className="mt-1 text-sm text-mute">Paso {step} de 4 · día, servicio, profesional y pago</p>
        {previous ? (
          <p className="mt-2 text-sm text-copper">Estás cambiando la cita del {formatLong(previous.start.slice(0, 10))}.</p>
        ) : null}
      </div>

      {step === 1 ? (
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => shiftMonth(-1)} className="text-sm">Anterior</button>
            <p className="font-medium capitalize">
              {new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </p>
            <button type="button" onClick={() => shiftMonth(1)} className="text-sm">Siguiente</button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-mute">
            {"L M X J V S D".split(" ").map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthCells(cursor.year, cursor.month).map((cell, index) => {
              if (!cell) return <span key={`empty-${index}`} />;
              const kind = dayTone(id, cell, store.appointments);
              const selected = date === cell;
              return (
                <button
                  key={cell}
                  type="button"
                  disabled={kind === "pasado" || kind === "cerrado"}
                  onClick={() => {
                    setDate(cell);
                    setTime(null);
                  }}
                  className={`h-10 rounded-xl text-sm ${selected ? "bg-ink text-paper" : toneClass(kind)}`}
                >
                  {Number(cell.slice(8))}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-5 text-mute">
            Verde, mucha disponibilidad. Ámbar, media. Cobre, poca. Tachado, completo.
          </p>
          {date && tone === "lleno" ? (
            <form
              className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-line"
              onSubmit={(event) => {
                event.preventDefault();
                store.joinWaitlist({
                  id: `wl-${(seq.current += 1)}`,
                  businessId: id,
                  clientId: CURRENT_CLIENT,
                  date,
                  professionalId: null,
                  band,
                  status: "esperando",
                });
                store.notify("Si se libera un hueco, avisamos al primero de la lista. Tienes 15 minutos para aceptarlo.");
              }}
            >
              <p className="font-medium">{formatLong(date)} está completo.</p>
              <p className="mt-1 text-sm text-mute">Puedes entrar en la lista de espera.</p>
              <div className="mt-3 flex gap-2">
                {(
                  [
                    ["manana", "Mañana"],
                    ["tarde", "Tarde"],
                    ["cualquiera", "Cualquiera"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBand(value)}
                    className={`rounded-full px-3 py-1 text-sm ${band === value ? "bg-ink text-paper" : "ring-1 ring-line"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button type="submit" className="mt-3 w-full rounded-full bg-copper py-3 text-sm text-white">
                Unirme a la lista
              </button>
            </form>
          ) : null}
          {date && tone !== "lleno" && tone !== "cerrado" && tone !== "pasado" ? (
            <div className="mt-4">
              <p className="text-sm">{formatLong(date)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {times.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`rounded-full px-3 py-1.5 text-sm ${time === slot ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}
                  >
                    {labelFromMinutes(slot)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-3 px-5 pt-4">
          {servicesOf(id).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setServiceId(item.id)}
              className={`rounded-3xl p-4 text-left ring-1 ${serviceId === item.id ? "bg-ink text-paper ring-ink" : "bg-card ring-line"}`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{item.name}</span>
                <span>{money(item.price)}</span>
              </span>
              <span className={`mt-1 block text-sm ${serviceId === item.id ? "text-paper/80" : "text-mute"}`}>
                {item.duration} min · {item.description}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {step === 3 && date && time !== null && service ? (
        <div className="flex flex-col gap-3 px-5 pt-4">
          <ProChoice
            label="Sin preferencia"
            detail="Se asigna a quien menos carga tenga ese día."
            active={proId === "any"}
            disabled={false}
            onClick={() => setProId("any")}
          />
          {prosForService(service.id).map((pro) => {
            const vacation = onVacation(pro.id, date);
            const free = slotFree({
              businessId: id,
              proId: pro.id,
              date,
              start: time,
              duration: service.duration,
              appointments: store.appointments,
            });
            const reason = vacation ? "Vacaciones" : free ? pro.title : "Ocupado a esa hora";
            return (
              <ProChoice
                key={pro.id}
                label={pro.name}
                detail={reason}
                active={proId === pro.id}
                disabled={!free}
                onClick={() => setProId(pro.id)}
              />
            );
          })}
        </div>
      ) : null}

      {step === 4 && service && date && time !== null ? (
        <div className="px-5 pt-4">
          <div className="rounded-3xl bg-card p-4 text-sm leading-6 ring-1 ring-line">
            <p className="font-medium">{service.name}</p>
            <p>{formatLong(date)} · {labelFromMinutes(time)}</p>
            <p className="text-mute">
              {proId === "any" ? "Profesional según carga del día" : prosOf(id).find((pro) => pro.id === proId)?.name}
            </p>
            <p>{pay === "bono" ? "Bono" : pay === "senal" ? `Señal de ${money(10)}` : money(service.price)}</p>
          </div>
          <div className="mt-4 flex flex-col gap-2" role="group" aria-label="Forma de pago">
            <PayButton current={pay} id="local" label="En el local" onPick={setPay} />
            <PayButton current={pay} id="app" label="Pagar en la app" onPick={setPay} />
            <PayButton current={pay} id="senal" label={`Señal ${money(10)}`} onPick={setPay} />
            {canUseBonus ? <PayButton current={pay} id="bono" label={`Usar mi bono, quedan ${store.bonusLeft}`} onPick={setPay} /> : null}
          </div>
          {service.consent ? (
            <div className="mt-4">
              <p className="text-sm">Color y mechas piden firma.</p>
              <Signature onChange={setSigned} />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-2 border-t border-line px-5 py-4">
        <button
          type="button"
          disabled={!canContinue()}
          onClick={() => {
            if (step < 4) setStep(step + 1);
            else if (pay === "app" || pay === "senal") setPaying(true);
            else commit(pay);
          }}
          className="min-h-12 w-full rounded-full bg-ink px-4 text-sm text-paper disabled:bg-line disabled:text-mute"
        >
          {step < 4 ? "Continuar" : "Confirmar cita"}
        </button>
        {step > 1 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="min-h-12 w-full rounded-full text-sm">
            Atrás
          </button>
        ) : null}
      </div>

      {paying ? (
        <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-ink/50">
          <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mute">Pago simulado</p>
            <h2 className="mt-1 font-serif text-3xl">{pay === "senal" ? money(10) : money(service?.price ?? 0)}</h2>
            <p className="mt-2 text-sm text-mute">Tarjeta ···· 4242. IMAGO no guarda el número.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setPaying(false)} className="flex-1 rounded-full border border-line py-3 text-sm">
                Cancelar
              </button>
              <button type="button" onClick={() => commit(pay)} className="flex-1 rounded-full bg-ink py-3 text-sm text-paper">
                Pagar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const dateValue = new Date(current.year, current.month - 1 + delta, 1);
      return { year: dateValue.getFullYear(), month: dateValue.getMonth() + 1 };
    });
  }

  function canContinue() {
    if (step === 1) return Boolean(date && time !== null && tone !== "lleno");
    if (step === 2) return Boolean(serviceId);
    if (step === 3) return proId === "any" || Boolean(proId);
    if (!service) return false;
    if (service.consent && !signed) return false;
    return true;
  }
}

function toneClass(tone: DayTone) {
  if (tone === "alta") return "bg-moss/15 text-moss";
  if (tone === "media") return "bg-amber/20 text-amber";
  if (tone === "baja") return "bg-copper/15 text-copper";
  if (tone === "lleno") return "text-mute line-through";
  return "text-mute/50";
}

function ProChoice({
  label,
  detail,
  active,
  disabled,
  onClick,
}: {
  label: string;
  detail: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-3xl px-4 py-3 text-left ring-1 disabled:opacity-40 ${
        active ? "bg-ink text-paper ring-ink" : "bg-card ring-line"
      }`}
    >
      <span className="block font-medium">{label}</span>
      <span className={`text-sm ${active ? "text-paper/75" : "text-mute"}`}>{detail}</span>
    </button>
  );
}

function PayButton({
  current,
  id,
  label,
  onPick,
}: {
  current: PayMethod;
  id: PayMethod;
  label: string;
  onPick: (value: PayMethod) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      className={`min-h-12 w-full rounded-2xl px-4 text-left text-sm ${current === id ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}
    >
      {label}
    </button>
  );
}

function Signature({ onChange }: { onChange: (ok: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  return (
    <div className="mt-2">
      <canvas
        ref={ref}
        width={640}
        height={280}
        className="h-36 w-full touch-none rounded-2xl border border-dashed border-line bg-paper"
        onPointerDown={(event) => {
          drawing.current = true;
          const ctx = ref.current?.getContext("2d");
          if (!ctx) return;
          const next = point(event);
          ctx.strokeStyle = "#8d3d2c";
          ctx.lineWidth = 2.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(next.x, next.y);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const ctx = ref.current?.getContext("2d");
          if (!ctx) return;
          const next = point(event);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
          onChange(true);
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
      />
      <button
        type="button"
        className="mt-2 text-sm text-mute"
        onClick={() => {
          const canvas = ref.current;
          if (!canvas) return;
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
          onChange(false);
        }}
      >
        Borrar firma
      </button>
    </div>
  );
}
