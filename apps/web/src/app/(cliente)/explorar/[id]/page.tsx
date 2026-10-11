import { Ficha } from "@/features/cliente/ficha";
import { businesses } from "@/lib/data";

export function generateStaticParams() {
  return businesses.map((business) => ({ id: business.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Ficha id={id} />;
}
