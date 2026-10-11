import { AiPanel } from "@/components/ai-panel";

export default function Page() {
  return (
    <div className="px-4 py-6 md:px-8">
      <h1 className="font-serif text-4xl">Asistente</h1>
      <p className="mt-1 max-w-xl text-sm text-mute">
        Pregunta por comisiones, huecos o días flojos. No inventa una hora que la agenda no tenga.
      </p>
      <div className="mt-5 max-w-xl rounded-3xl bg-card p-4 ring-1 ring-line">
        <AiPanel mode="negocio" />
      </div>
    </div>
  );
}
