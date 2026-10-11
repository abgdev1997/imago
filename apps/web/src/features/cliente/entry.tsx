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

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#1c1612] text-[#f6f1ea]">
      <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#8d3d2c]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#c4a574]/10 blur-3xl" />
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-between px-6 py-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[#d7c4b4]">
          Estudios de imagen
        </p>
        <div>
          <h1 className="font-serif text-6xl tracking-[0.22em]">IMAGO</h1>
          <p className="mt-4 max-w-xs text-lg leading-7 text-[#eadfd3]">
            Pide cita como se la pedirías a alguien del estudio.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button type="button" onClick={go} className="rounded-full bg-[#f6f1ea] px-4 py-3 text-sm text-[#1c1612]">
              Continuar con Apple
            </button>
            <button type="button" onClick={go} className="rounded-full border border-[#f6f1ea]/30 px-4 py-3 text-sm">
              Continuar con Google
            </button>
            {emailMode ? (
              <form
                className="rounded-3xl border border-[#f6f1ea]/20 p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  go();
                }}
              >
                <label className="text-xs uppercase tracking-[0.16em] text-[#d7c4b4]" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl bg-[#f6f1ea] px-3 py-2 text-sm text-[#1c1612] outline-none"
                />
                <button type="submit" className="mt-3 w-full rounded-full bg-[#8d3d2c] px-4 py-3 text-sm">
                  Entrar como Lucía
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setEmailMode(true)}
                className="rounded-full border border-[#f6f1ea]/30 px-4 py-3 text-sm"
              >
                Continuar con email
              </button>
            )}
            <div className="flex gap-4 text-sm text-[#d7c4b4]">
              <button type="button" onClick={go}>Facebook</button>
              <button type="button" onClick={go}>Instagram</button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#b7a89c]">Maqueta · octubre 2026</span>
          <Link href="/business" transitionTypes={["nav-fade"]} className="inline-flex min-h-11 items-center text-[#f0d2c4]">
            Soy un negocio
          </Link>
        </div>
      </div>
    </main>
  );
}
