"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  average: number;
};

function ratingLabel(value: number) {
  return value.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function priceLabel(value: number) {
  return `${Math.round(value).toLocaleString("es-ES")} €`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pinMarkup(place: MapPlace, selected: boolean) {
  const score = ratingLabel(place.rating);
  const price = priceLabel(place.average);
  const label = escapeHtml(`${place.name}, nota ${score}, precio medio ${price}`);
  return `<div class="imago-pin${selected ? " is-on" : ""}" aria-hidden="true" title="${label}"><span class="imago-pin-score">${score}</span><span class="imago-pin-price">${price}</span></div>`;
}

export function BusinessMap({
  places,
  selectedId,
  onSelect,
}: {
  places: MapPlace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const onSelectRef = useRef(onSelect);
  const fitted = useRef("");
  const [ready, setReady] = useState(false);

  onSelectRef.current = onSelect;

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    const map = L.map(node, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView([39.472, -0.372], 13);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;
    const frame = requestAnimationFrame(() => map.invalidateSize());
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(node);
    setReady(true);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const group = L.layerGroup().addTo(map);
    const points: L.LatLngExpression[] = [];

    for (const place of places) {
      const selected = place.id === selectedId;
      const score = ratingLabel(place.rating);
      const price = priceLabel(place.average);
      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          className: "imago-pin-wrap",
          html: pinMarkup(place, selected),
          iconSize: [64, 58],
          iconAnchor: [32, 58],
        }),
        keyboard: true,
        title: `${place.name}. Nota ${score}. Precio medio ${price}.`,
        zIndexOffset: selected ? 500 : 0,
      });
      marker.on("click", () => onSelectRef.current(place.id));
      marker.addTo(group);
      points.push([place.lat, place.lng]);
    }

    const signature = places.map((place) => place.id).join("|");
    if (points.length > 0 && fitted.current !== signature) {
      map.fitBounds(L.latLngBounds(points), { padding: [56, 48], maxZoom: 14, animate: false });
      fitted.current = signature;
    }

    return () => {
      group.remove();
    };
  }, [places, selectedId, ready]);

  return (
    <div className="relative h-96 overflow-hidden rounded-3xl ring-1 ring-line">
      <div ref={host} className="h-full w-full" aria-label="Mapa de estudios en València" />
      {places.length === 0 ? (
        <p className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl bg-card px-4 py-3 text-sm text-mute ring-1 ring-line">
          Ningún estudio en el mapa con ese filtro.
        </p>
      ) : null}
    </div>
  );
}
