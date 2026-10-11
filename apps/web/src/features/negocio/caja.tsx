"use client";

import { useState } from "react";
import {
  BUSINESS_ID,
  clientById,
  products,
  proById,
  prosOf,
  serviceById,
  servicesOf,
} from "@/lib/data";
import { TODAY, money } from "@/lib/format";
import { useStore } from "@/lib/store";

type Line = {
  key: string;
  name: string;
  price: number;
  kind: "servicio" | "producto";
  rate: number;
};

const methods = ["Tap to Pay", "Datáfono", "Bizum", "Efectivo", "Bono", "Tarjeta regalo"] as const;

export function Caja() {
  const store = useStore();
  const [proId, setProId] = useState("marcos");
  const [lines, setLines] = useState<Line[]>([
    { key: "corte", name: "Corte clásico", price: 28, kind: "servicio", rate: 40 },
  ]);
  const [tip, setTip] = useState(0);
  const [method, setMethod] = useState<(typeof methods)[number]>("Tap to Pay");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [linked, setLinked] = useState<string | null>(null);

  const today = store.appointments.filter(
    (appointment) =>
      appointment.businessId === BUSINESS_ID &&
      appointment.start.startsWith(TODAY) &&
      appointment.status === "confirmada",
  );
  const subtotal = lines.reduce((sum, line) => sum + line.price, 0);
  const tipAmount = tip === 10 ? Math.round(subtotal * 0.1 * 100) / 100 : tip;
  const pro = proById(proId);
  const serviceFee = lines
    .filter((line) => line.kind === "servicio")
    .reduce((sum, line) => sum + (pro?.role === "propietario" ? 0 : (line.price * (pro?.commission ?? 0)) / 100), 0);
  const productFee = lines
    .filter((line) => line.kind === "producto")
    .reduce((sum, line) => sum + (pro?.role === "propietario" ? 0 : (line.price * line.rate) / 100), 0);

  function addService(id: string) {
    const service = serviceById(id);
    if (!service) return;
    setLines((current) => [
      ...current,
      { key: `${id}-${current.length}`, name: service.name, price: service.price, kind: "servicio", rate: pro?.commission ?? 0 },
    ]);
  }

  function addProduct(id: string) {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    setLines((current) => [
      ...current,
      { key: `${id}-${current.length}`, name: product.name, price: product.price, kind: "producto", rate: product.commission },
    ]);
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-serif text-4xl">Caja</h1>
      <p className="mt-1 text-sm text-mute">Ticket de hoy. La propina va entera al profesional. El propietario no cobra comisión.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl bg-card p-4 ring-1 ring-line">
          <h2 className="font-serif text-2xl">Ticket</h2>
          {today.length > 0 ? (
            <label className="mt-3 block text-sm">
              Cita de hoy
              <select
                value={linked ?? ""}
                onChange={(event) => setLinked(event.target.value || null)}
                className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2"
              >
                <option value="">Venta directa</option>
                {today.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.start.slice(11, 16)} · {clientById(appointment.clientId)?.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="mt-2 text-sm text-mute">Hoy no hay citas confirmadas. Puedes hacer una venta directa.</p>
          )}
          <label className="mt-3 block text-sm">
            Quién cobra
            <select value={proId} onChange={(event) => setProId(event.target.value)} className="mt-1 w-full rounded-2xl border border-line bg-paper px-3 py-2">
              {prosOf(BUSINESS_ID).map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} {person.role === "propietario" ? "· sin comisión" : `· ${person.commission}%`}
                </option>
              ))}
            </select>
          </label>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {lines.map((line) => (
              <li key={line.key} className="flex items-center justify-between gap-3">
                <span>{line.name} <span className="text-mute">· {line.kind}</span></span>
                <span className="flex items-center gap-3">
                  {money(line.price)}
                  <button type="button" onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))} className="text-mute">
                    Quitar
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {servicesOf(BUSINESS_ID).map((service) => (
              <button key={service.id} type="button" onClick={() => addService(service.id)} className="rounded-full border border-line px-3 py-1 text-xs">
                + {service.name}
              </button>
            ))}
            {products.map((product) => (
              <button key={product.id} type="button" onClick={() => addProduct(product.id)} className="rounded-full border border-line px-3 py-1 text-xs">
                + {product.name}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-card p-4 ring-1 ring-line">
          <h2 className="font-serif text-2xl">Cobro</h2>
          <p className="mt-3 text-sm">Propina</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              [0, "Sin propina"],
              [1, "1 €"],
              [2, "2 €"],
              [10, "10 %"],
            ].map(([value, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => setTip(Number(value))}
                className={`rounded-full px-3 py-1.5 text-sm ${tip === value ? "bg-ink text-paper" : "ring-1 ring-line"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {methods.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMethod(item)}
                className={`rounded-2xl px-3 py-2 text-sm ${method === item ? "bg-ink text-paper" : "ring-1 ring-line"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><dt>Servicios y productos</dt><dd>{money(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Propina para {pro?.name.split(" ")[0]}</dt><dd>{money(tipAmount)}</dd></div>
            <div className="flex justify-between"><dt>Comisión servicios</dt><dd>{money(serviceFee)}</dd></div>
            <div className="flex justify-between"><dt>Comisión productos</dt><dd>{money(productFee)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total a cobrar</dt><dd>{money(subtotal + tipAmount)}</dd></div>
          </dl>
          <button
            type="button"
            onClick={() => {
              if (linked) store.setStatus(linked, "completada");
              const number = `T-${String(Date.now()).slice(-4)}`;
              setReceipt(number);
              store.notify(`Cobrado con ${method}. Ticket ${number}.`);
            }}
            className="mt-4 w-full rounded-full bg-ink py-3 text-sm text-paper"
          >
            Cobrar {money(subtotal + tipAmount)}
          </button>
          {receipt ? (
            <p className="mt-3 text-sm leading-6 text-mute">
              Ticket {receipt} listo. En 2027 saldría por un proveedor de Verifactu. Esta maqueta no lo envía.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
