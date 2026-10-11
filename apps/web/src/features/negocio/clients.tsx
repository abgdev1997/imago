"use client";

import Link from "next/link";
import { useState } from "react";
import { BUSINESS_ID, clients } from "@/lib/data";
import { isFirst } from "@/lib/schedule";
import { useStore } from "@/lib/store";

const filters = ["Todos", "Nuevos", "Confianza", "Bloqueados"] as const;

export function Clients() {
  const { appointments, blockedIds } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todos");
  const [query, setQuery] = useState("");
  const people = clients.filter((client) => client.primary);

  const list = people.filter((client) => {
    if (!client.name.toLowerCase().includes(query.toLowerCase())) return false;
    const first = isFirst(client.id, BUSINESS_ID, appointments);
    const blocked = blockedIds.includes(client.id);
    if (filter === "Nuevos") return first;
    if (filter === "Confianza") return client.trust === "alta" && !blocked;
    if (filter === "Bloqueados") return blocked;
    return true;
  });

  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-serif text-4xl">Clientes</h1>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nombre"
        className="mt-4 w-full max-w-md rounded-full border border-line bg-card px-4 py-3 text-sm outline-none"
      />
      <div className="mt-3 flex gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-3 py-1.5 text-sm ${filter === item ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((client) => {
          const first = isFirst(client.id, BUSINESS_ID, appointments);
          const blocked = blockedIds.includes(client.id);
          return (
            <li key={client.id}>
              <Link href={`/business/clientes/${client.id}`} transitionTypes={["nav-forward"]} className="block rounded-3xl bg-card p-4 ring-1 ring-line">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{client.name}</p>
                  {first ? <span className="text-xs text-copper">FIRST</span> : null}
                  {blocked ? <span className="text-xs text-mute">Bloqueado</span> : null}
                </div>
                <p className="text-sm text-mute">Confianza {client.trust} · desde {client.memberSince}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
