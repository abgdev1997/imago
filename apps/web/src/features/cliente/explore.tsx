"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { averagePrice, businesses } from "@/lib/data";
import { money } from "@/lib/format";
import { affinity } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { MapPlace } from "./business-map";

const BusinessMap = dynamic(
  () => import("./business-map").then((mod) => mod.BusinessMap),
  {
    ssr: false,
    loading: () => <div className="h-96 animate-pulse rounded-3xl bg-card ring-1 ring-line" aria-hidden />,
  },
);

type SortKey = "cerca" | "valoracion" | "afinidad";

function ratingLabel(value: number) {
  return value.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function Explore() {
  const params = useSearchParams();
  const { prefs } = useStore();
  const initialCat = params.get("cat") ?? "Todas";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(initialCat);
  const [sort, setSort] = useState<SortKey>("cerca");
  const [picked, setPicked] = useState<string | null>(null);

  const list = useMemo(() => {
    const filtered = businesses.filter((business) => {
      const haystack = `${business.name} ${business.neighborhood} ${business.category}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase().trim());
      const matchesCat = category === "Todas" || business.category === category;
      return matchesQuery && matchesCat;
    });
    return filtered.sort((a, b) => {
      if (sort === "valoracion") return b.rating - a.rating;
      if (sort === "afinidad") return affinity(b, prefs) - affinity(a, prefs);
      return a.distanceKm - b.distanceKm;
    });
  }, [query, category, sort, prefs]);

  const current = list.find((business) => business.id === picked) ?? list[0] ?? null;
  const places = useMemo<MapPlace[]>(
    () =>
      list.map((business) => ({
        id: business.id,
        name: business.name,
        lat: business.lat,
        lng: business.lng,
        rating: business.rating,
        average: averagePrice(business.id),
      })),
    [list],
  );

  return (
    <div className="px-5 pt-6">
      <h1 className="font-serif text-4xl">Explorar</h1>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Nombre, barrio o servicio"
        className="mt-4 w-full rounded-full border border-line bg-card px-4 py-3 text-sm outline-none"
      />
      <div className="mt-3 flex gap-2 overflow-auto">
        {["Todas", "Barbería", "Color", "Estética", "Uñas"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              category === item ? "bg-ink text-paper" : "bg-card ring-1 ring-line"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {(
          [
            ["cerca", "Cerca"],
            ["valoracion", "Nota"],
            ["afinidad", "Afinidad"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSort(id)}
            className={`text-sm ${sort === id ? "text-ink underline" : "text-mute"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <BusinessMap places={places} selectedId={current?.id ?? null} onSelect={setPicked} />
        {current ? (
          <Link
            href={`/explorar/${current.id}`}
            transitionTypes={["nav-forward"]}
            className="mt-3 block rounded-3xl bg-card p-4 ring-1 ring-line"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-copper">{current.neighborhood}</p>
            <p className="mt-1 font-medium">{current.name}</p>
            <p className="mt-1 text-sm">
              Nota {ratingLabel(current.rating)} · {current.reviewCount} reseñas · media {money(averagePrice(current.id))}
            </p>
            <p className="text-sm leading-6 text-mute">
              {current.distanceKm.toLocaleString("es-ES")} km · {current.blurb} Afinidad {affinity(current, prefs)}.
            </p>
          </Link>
        ) : null}
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {list.map((business) => (
          <li key={business.id}>
            <BusinessCard
              business={business}
              score={affinity(business, prefs)}
              selected={current?.id === business.id}
              onSelect={() => setPicked(business.id)}
            />
          </li>
        ))}
        {list.length === 0 ? <li className="text-sm text-mute">Ningún estudio con ese filtro.</li> : null}
      </ul>
    </div>
  );
}

function BusinessCard({
  business,
  score,
  selected,
  onSelect,
}: {
  business: (typeof businesses)[number];
  score: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className={`rounded-3xl bg-card ring-1 ${selected ? "ring-ink" : "ring-line"}`}>
      <button type="button" onClick={onSelect} className="flex w-full gap-3 p-3 text-left">
        <div className="h-24 w-24 shrink-0 rounded-2xl" style={{ background: business.cover }} />
        <div className="min-w-0">
          <p className="font-medium">{business.name}</p>
          <p className="text-sm text-mute">
            {business.neighborhood} · {business.distanceKm.toLocaleString("es-ES")} km
          </p>
          <p className="mt-1 text-sm">
            {ratingLabel(business.rating)} · media {money(averagePrice(business.id))}
          </p>
          <p className="text-sm text-mute">
            {business.reviewCount} reseñas · afinidad {score}
          </p>
        </div>
      </button>
      <div className="border-t border-line px-3 py-2">
        <Link href={`/explorar/${business.id}`} transitionTypes={["nav-forward"]} className="text-sm text-copper">
          Ver ficha
        </Link>
      </div>
    </div>
  );
}
