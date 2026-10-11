import { ClientFile } from "@/features/negocio/client-file";
import { clients } from "@/lib/data";

export function generateStaticParams() {
  return clients.filter((client) => client.primary).map((client) => ({ id: client.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientFile id={id} />;
}
