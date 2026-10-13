export function StudioFrame({ app }: { app: "cliente" | "business" }) {
  const business = app === "business";
  const src = business ? "/studio/business.html" : "/studio/clientes.html";

  return (
    <div className="fixed inset-0 flex flex-col bg-[#09090b]">
      <nav className="flex shrink-0 justify-center px-3 pt-[max(8px,env(safe-area-inset-top))] pb-2" aria-label="App">
        <div className="grid w-full max-w-[240px] grid-cols-2 rounded-full border border-white/10 bg-[#131316] p-1 text-sm font-semibold">
          <a
            href="/"
            aria-current={business ? undefined : "page"}
            className={`grid h-9 place-items-center rounded-full ${business ? "text-[#f4f2ee]/70" : "bg-[#f4f2ee] text-[#09090b]"}`}
          >
            Clientes
          </a>
          <a
            href="/negocio"
            aria-current={business ? "page" : undefined}
            className={`grid h-9 place-items-center rounded-full ${business ? "bg-[#f4f2ee] text-[#09090b]" : "text-[#f4f2ee]/70"}`}
          >
            Business
          </a>
        </div>
      </nav>
      <iframe src={src} title={business ? "IMAGO Business" : "IMAGO"} className="min-h-0 w-full flex-1 border-0 bg-[#09090b]" />
    </div>
  );
}
