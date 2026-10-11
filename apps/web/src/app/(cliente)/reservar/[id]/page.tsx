import { Suspense } from "react";
import { Booking } from "@/features/cliente/booking";
import { businesses } from "@/lib/data";

export function generateStaticParams() {
  return businesses.map((business) => ({ id: business.id }));
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="px-5 pt-6 text-sm text-mute">Cargando la reserva…</p>}>
      <BookingFromQuery params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function BookingFromQuery({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return (
    <Booking
      id={id}
      initial={{
        date: one(query.dia),
        time: one(query.hora),
        serviceId: one(query.servicio),
        proId: one(query.pro),
        cita: one(query.cita),
        paso: one(query.paso),
      }}
    />
  );
}
