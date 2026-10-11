"use client";

import { useState } from "react";
import { devices, invoices, products, prosOf, servicesOf, worksOf } from "@/lib/data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

const sections = [
  "Portada y QR",
  "Perfil y equipo",
  "Horario",
  "Política y agenda",
  "Galería",
  "Marketing",
  "Recordatorios",
  "Recepcionista",
  "Estadísticas",
  "Suscripción",
  "Dispositivos",
  "Bonos",
] as const;

type Section = (typeof sections)[number];

export function Settings() {
  const store = useStore();
  const [section, setSection] = useState<Section>("Portada y QR");
  const [assign, setAssign] = useState("menos carga");
  const [smart, setSmart] = useState(true);
  const [cancelHours, setCancelHours] = useState(12);
  const [changeHours, setChangeHours] = useState(6);

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-serif text-4xl">Ajustes</h1>
      <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="flex gap-2 overflow-auto lg:flex-col">
          {sections.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={`shrink-0 rounded-2xl px-3 py-2 text-left text-sm ${section === item ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <section className="rounded-3xl bg-card p-5 ring-1 ring-line">
          <h2 className="font-serif text-3xl">{section}</h2>
          {section === "Portada y QR" ? (
            <div className="mt-3 text-sm leading-6">
              <div className="h-28 rounded-3xl" style={{ background: "linear-gradient(150deg, #241c17, #7a3e2c 60%, #d7b48a)" }} />
              <p className="mt-3">Sublime Barber Studio · Ruzafa. El QR de recepción abre la ficha para reservar sin instalar nada.</p>
              <div className="mt-3 grid h-28 w-28 grid-cols-5 gap-1 rounded-2xl bg-paper p-2">
                {Array.from({ length: 25 }, (_, index) => (
                  <span key={index} className={index % 3 === 0 || index % 4 === 0 ? "bg-ink" : "bg-transparent"} />
                ))}
              </div>
            </div>
          ) : null}
          {section === "Perfil y equipo" ? (
            <ul className="mt-3 flex flex-col gap-3 text-sm">
              {prosOf("sublime").map((pro) => (
                <li key={pro.id} className="rounded-2xl bg-paper p-3">
                  <p className="font-medium">{pro.name}</p>
                  <p className="text-mute">{pro.title} · {pro.role} · comisión {pro.commission}%</p>
                  <p>{pro.bio}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {section === "Horario" ? (
            <p className="mt-3 text-sm leading-6">Lunes a sábado de 10:00 a 20:00, en tramos de 30 minutos. Domingo cerrado. Inés no trabaja del 20 al 24 de octubre: el muro lo anuncia y la agenda no ofrece sus horas.</p>
          ) : null}
          {section === "Política y agenda" ? (
            <div className="mt-3 flex flex-col gap-3 text-sm">
              <label className="block">
                Cancelar gratis hasta
                <input type="number" value={cancelHours} onChange={(event) => setCancelHours(Number(event.target.value))} className="mt-1 w-24 rounded-xl border border-line bg-paper px-2 py-1" /> h
              </label>
              <label className="block">
                Cambiar hasta
                <input type="number" value={changeHours} onChange={(event) => setChangeHours(Number(event.target.value))} className="mt-1 w-24 rounded-xl border border-line bg-paper px-2 py-1" /> h
              </label>
              <p>Máximo 2 citas a la vez. Antelación máxima 60 días. Señal de {money(10)} si el cliente es nuevo.</p>
              <label className="block">
                Si no tiene preferencia
                <select value={assign} onChange={(event) => setAssign(event.target.value)} className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2">
                  <option value="menos carga">Quien menos carga tenga ese día</option>
                  <option value="aleatoria">Aleatoria</option>
                  <option value="turnos">Por turnos</option>
                </select>
              </label>
              <button type="button" onClick={() => setSmart((value) => !value)} className="rounded-2xl bg-paper px-3 py-3 text-left">
                Agenda inteligente {smart ? "activada" : "apagada"}. Ofrece primero horas pegadas a otras citas y no deja huecos más cortos que el servicio más breve.
              </button>
              <p className="text-mute">Ahora mismo la reserva usa «{assign}».</p>
            </div>
          ) : null}
          {section === "Galería" ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {worksOf("sublime").map((work) => (
                <li key={work.id} className="overflow-hidden rounded-3xl ring-1 ring-line">
                  <div className="h-24" style={{ background: work.tone }} />
                  <div className="p-3 text-sm">
                    <p className="font-medium">{work.title}</p>
                    <p className="text-moss">Apto</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {section === "Marketing" ? (
            <div className="mt-3 text-sm leading-6">
              <p>El martes está flojo. La oferta solo se aplica a las horas marcadas, no a todo el día.</p>
              {store.offer ? (
                <p className="mt-2 text-moss">Publicada: {store.offer.note}</p>
              ) : (
                <button
                  type="button"
                  className="mt-3 rounded-full bg-ink px-4 py-2 text-paper"
                  onClick={() => {
                    store.publishOffer({
                      businessId: "sublime",
                      date: "2026-10-13",
                      from: "16:00",
                      to: "19:00",
                      discount: 15,
                      note: "−15% en Sublime el martes 13, de 16:00 a 19:00",
                    });
                    store.notify("Oferta visible en el inicio de Lucía.");
                  }}
                >
                  Publicar −15% el martes
                </button>
              )}
              <p className="mt-3 text-mute">Recompensas: 5 visitas y el sexto corte tiene un 20%. Google e Instagram están conectados solo como demostración.</p>
            </div>
          ) : null}
          {section === "Recordatorios" ? (
            <div className="mt-3 text-sm leading-6">
              <p>
                Plantilla 24 h: «Hola Lucía, mañana a las 17:30 tienes barba con Marcos.
                Responde 1 para confirmar o 2 para cambiar.»
              </p>
              <p className="mt-2">Plantilla 2 h: el mismo texto, más corto. Si no hay WhatsApp, pasa a SMS.</p>
            </div>
          ) : null}
          {section === "Recepcionista" ? (
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Bubble mine text="Hola, ¿me puedes poner un corte el viernes por la tarde?" />
              <Bubble text="El viernes 16 Marcos tiene las 17:30 libres. ¿Lo dejo confirmado?" />
              <Bubble mine text="Sí" />
              <Bubble text="Listo. Corte clásico, 28 €, con Marcos. Si hace falta una persona, te paso con el estudio." />
              <p className="text-mute">La recepcionista solo usa huecos y precios que devuelve el sistema. Si duda, avisa a Javi.</p>
            </div>
          ) : null}
          {section === "Estadísticas" ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-2xl bg-paper p-3"><p className="text-mute">Semana 12–18</p><p className="font-serif text-3xl">{money(486)}</p></div>
              <div className="rounded-2xl bg-paper p-3"><p className="text-mute">Ocupación media</p><p className="font-serif text-3xl">54%</p></div>
              <div className="rounded-2xl bg-paper p-3"><p className="text-mute">Servicio estrella</p><p className="font-serif text-3xl">Corte</p></div>
              <p className="sm:col-span-3 text-mute">Productos en stock: {products.map((product) => `${product.name} ${product.stock}`).join(" · ")}. Servicios activos: {servicesOf("sublime").length}.</p>
            </div>
          ) : null}
          {section === "Suscripción" ? (
            <div className="mt-3 text-sm leading-6">
              <p>Plan Estudio · {money(49)} al mes · activo.</p>
              <ul className="mt-2">
                {invoices.map((invoice) => (
                  <li key={invoice.id}>{invoice.id} · {invoice.period} · {money(invoice.amount)} · {invoice.state}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {section === "Dispositivos" ? (
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {devices.map((device) => (
                <li key={device.id} className="rounded-2xl bg-paper p-3">
                  {device.name} · {device.last} {device.current ? "· este" : ""}
                </li>
              ))}
              <button type="button" onClick={() => store.notify("Simulado: cerraríamos la sesión del iPad.")} className="text-left text-copper">
                Cerrar sesión en el iPad
              </button>
            </ul>
          ) : null}
          {section === "Bonos" ? (
            <p className="mt-3 text-sm leading-6">Bono 5 cortes · {money(120)} · 5 usos. Lucía tiene 3 restantes en la maqueta. Las tarjetas regalo se canjean en caja.</p>
          ) : null}
          <button type="button" onClick={() => store.reset()} className="mt-6 text-sm text-mute">
            Restablecer datos de prueba
          </button>
        </section>
      </div>
    </div>
  );
}

function Bubble({ text, mine = false }: { text: string; mine?: boolean }) {
  return (
    <p className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "ml-auto bg-ink text-paper" : "bg-paper"}`}>
      {text}
    </p>
  );
}
