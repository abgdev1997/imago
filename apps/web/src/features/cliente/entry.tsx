"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readSession, useStore } from "@/lib/store";

export function Entry() {
  const router = useRouter();
  const { session, enter } = useStore();
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("lucia.marin@email.com");

  useEffect(() => {
    if (readSession()) router.replace("/inicio", { transitionTypes: ["nav-forward"] });
  }, [session, router]);

  function go() {
    enter();
  }

  const glass =
    "flex h-[52px] w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-[15.5px] font-semibold text-white backdrop-blur-md";

  return (
    <main className="relative flex min-h-dvh items-end overflow-hidden bg-black text-white">
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="relative z-[1] mx-auto flex w-full max-w-[390px] flex-col gap-3.5 px-5 pb-8">
        <div className="mb-1 flex items-center gap-3">
          <span className="orbe" aria-hidden="true" />
          <h1 className="marca text-[28px]">IMAGO</h1>
        </div>
        <p className="italic-serif mb-2 text-2xl leading-snug text-white/80">
          Pide cita como se la pedirías a alguien del estudio.
        </p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={go} className="flex h-[52px] w-full items-center justify-center rounded-full bg-white px-5 text-[15.5px] font-semibold text-black">
            Continuar con Apple
          </button>
          <button type="button" onClick={go} className={glass}>
            Continuar con Google
          </button>
          {emailMode ? (
            <form
              className="rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur-md"
              onSubmit={(event) => {
                event.preventDefault();
                go();
              }}
            >
              <label className="text-xs uppercase tracking-[0.14em] text-white/60" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded-[14px] border border-white/15 bg-black/40 px-4 text-[15px] text-white outline-none"
              />
              <button type="submit" className="mt-3 flex h-[52px] w-full items-center justify-center rounded-full bg-white text-[15.5px] font-semibold text-black">
                Entrar como Lucía
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setEmailMode(true)} className={glass}>
              Continuar con email
            </button>
          )}
          <div className="flex gap-4 text-sm text-white/70">
            <button type="button" onClick={go}>Facebook</button>
            <button type="button" onClick={go}>Instagram</button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-white/50">
          <span>Maqueta · octubre 2026</span>
          <Link href="/business" transitionTypes={["nav-fade"]} className="inline-flex min-h-11 items-center text-white/80">
            Soy un negocio
          </Link>
        </div>
      </div>
    </main>
  );
}
