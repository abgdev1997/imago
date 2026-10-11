"use client";

import Link from "next/link";
import { useState } from "react";
import { proById } from "@/lib/data";
import { money, labelFromMinutes } from "@/lib/format";
import { occupancy, slowDays, startTimes, weekDays } from "@/lib/schedule";
import { useStore } from "@/lib/store";

type Msg = {
  from: "ia" | "yo";
  text: string;
  href?: string;
  hrefLabel?: string;
};

export function AiPanel({ mode }: { mode: "cliente" | "negocio" }) {
  const { appointments } = useStore();
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "ia",
      text:
        mode === "cliente"
          ? "Dime qué quieres y te llevo al hueco. Por ejemplo: corte el viernes por la tarde."
          : "Puedo mirar comisiones, huecos de mañana o un día flojo. No invento horas ni precios.",
    },
  ]);
  const [text, setText] = useState("");

  function send(value: string) {
    const clean = value.trim();
    if (!clean) return;
    const reply =
      mode === "cliente"
        ? replyCliente(clean, appointments)
        : replyNegocio(clean, appointments);
    setMessages((current) => [...current, { from: "yo", text: clean }, reply]);
    setText("");
  }

  const suggestions =
    mode === "cliente"
      ? ["Corte el viernes por la tarde", "Quiero color", "¿Qué hay el lunes?"]
      : ["Comisiones de la semana", "Huecos del viernes", "Días flojos"];

  return (
    <div>
      <div className="flex max-h-[46dvh] flex-col gap-3 overflow-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.from}-${index}`}
            className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-5 ${
              message.from === "yo"
                ? "ml-auto bg-ink text-paper"
                : "bg-card text-ink ring-1 ring-line"
            }`}
          >
            <p>{message.text}</p>
            {message.href ? (
              <Link href={message.href} transitionTypes={["nav-forward"]} className="mt-2 inline-flex min-h-11 items-center text-copper underline">
                {message.hrefLabel}
              </Link>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => send(suggestion)}
            className="rounded-full border border-line px-3 py-1 text-xs"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send(text);
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribe aquí"
          className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2 text-sm outline-none"
        />
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm text-paper">
          Enviar
        </button>
      </form>
    </div>
  );
}

function replyCliente(
  text: string,
  appointments: Parameters<typeof startTimes>[0]["appointments"],
): Msg {
  const query = text.toLowerCase();
  if (query.includes("color") || query.includes("mecha")) {
    const times = startTimes({
      businessId: "sublime",
      date: "2026-10-16",
      duration: 90,
      appointments,
      proId: "ines",
    });
    if (times.length === 0) {
      return {
        from: "ia",
        text: "Inés no tiene 90 minutos libres el viernes. Del 20 al 24 está de vacaciones y el sábado 17 la agenda está completa.",
      };
    }
    const hour = labelFromMinutes(times[0]);
    return {
      from: "ia",
      text: `Inés puede hacerte el color el viernes 16 a las ${hour}. En el último paso hay que firmar el consentimiento.`,
      href: `/reservar/sublime?dia=2026-10-16&hora=${hour}&servicio=color&pro=ines&paso=4`,
      hrefLabel: "Ir a confirmar",
    };
  }

  if (query.includes("viernes") || query.includes("corte") || query.includes("tarde")) {
    const times = startTimes({
      businessId: "sublime",
      date: "2026-10-16",
      duration: 30,
      appointments,
      proId: "marcos",
    }).filter((time) => time >= 16 * 60);
    if (times.length === 0) {
      return {
        from: "ia",
        text: "El viernes por la tarde Marcos ya no tiene un corte libre. Puedes mirar el calendario y elegir otra hora.",
        href: "/reservar/sublime",
        hrefLabel: "Abrir calendario",
      };
    }
    const hour = labelFromMinutes(times.includes(17 * 60 + 30) ? 17 * 60 + 30 : times[0]);
    return {
      from: "ia",
      text: `Marcos tiene el corte el viernes 16 a las ${hour} en Sublime. Te dejo en el último paso.`,
      href: `/reservar/sublime?dia=2026-10-16&hora=${hour}&servicio=corte&pro=marcos&paso=4`,
      hrefLabel: "Confirmar esta cita",
    };
  }

  if (query.includes("lunes") || query.includes("mañana") || query.includes("manana")) {
    const times = startTimes({
      businessId: "sublime",
      date: "2026-10-12",
      duration: 30,
      appointments,
    });
    if (times.length === 0) {
      return { from: "ia", text: "El lunes no queda ningún hueco de 30 minutos." };
    }
    const sample = times.slice(0, 4).map(labelFromMinutes).join(", ");
    return {
      from: "ia",
      text: `El lunes 12 aún hay hueco, por ejemplo a las ${sample}.`,
      href: "/reservar/sublime",
      hrefLabel: "Elegir en el calendario",
    };
  }

  return {
    from: "ia",
    text: "Puedo proponerte un corte, un color o mirar el lunes. No reservo una hora que no esté libre.",
  };
}

function replyNegocio(
  text: string,
  appointments: Parameters<typeof startTimes>[0]["appointments"],
): Msg {
  const query = text.toLowerCase();
  if (query.includes("comisi")) {
    const days = weekDays("2026-10-12");
    let total = 0;
    const lines: string[] = [];
    for (const appointment of appointments) {
      const date = appointment.start.slice(0, 10);
      if (!days.includes(date)) continue;
      if (["cancelada", "no_vino"].includes(appointment.status)) continue;
      const pro = proById(appointment.professionalId);
      if (!pro || pro.role === "propietario") continue;
      const fee = (appointment.amount * pro.commission) / 100;
      total += fee;
      lines.push(`${pro.name.split(" ")[0]} ${appointment.start.slice(11, 16)} · ${money(fee)}`);
    }
    return {
      from: "ia",
      text: `Si se completan las citas del 12 al 18, las comisiones suman ${money(total)}. Javi, al ser propietario, no lleva comisión. ${lines.slice(0, 4).join(" · ")}`,
    };
  }

  if (query.includes("hueco") || query.includes("viernes")) {
    const times = startTimes({
      businessId: "sublime",
      date: "2026-10-16",
      duration: 30,
      appointments,
    });
    const percent = occupancy("sublime", "2026-10-16", appointments);
    return {
      from: "ia",
      text: `El viernes está al ${percent ?? 0}% de ocupación. Hay ${times.length} inicios libres de 30 minutos. El primero es a las ${times[0] ? labelFromMinutes(times[0]) : "—"}.`,
    };
  }

  if (query.includes("flojo") || query.includes("oferta")) {
    const days = slowDays("sublime", "2026-10-11", appointments, 40);
    if (days.length === 0) {
      return { from: "ia", text: "En los próximos 7 días ningún día baja del 40%." };
    }
    const list = days
      .map((day) => `${day.date.slice(8)} oct al ${day.percent}%`)
      .join(", ");
    return {
      from: "ia",
      text: `Días por debajo del 40%: ${list}. Puedes publicar un −15% en Ajustes → Marketing, solo para esas horas.`,
    };
  }

  return {
    from: "ia",
    text: "Pregúntame por las comisiones de la semana, los huecos del viernes o los días flojos.",
  };
}
