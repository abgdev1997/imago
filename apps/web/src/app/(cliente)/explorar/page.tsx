import { Suspense } from "react";
import { Explore } from "@/features/cliente/explore";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-mute">Cargando estudios…</p>}>
      <Explore />
    </Suspense>
  );
}
