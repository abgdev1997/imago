"use client";

import { useState } from "react";
import { clientById, CURRENT_CLIENT, giftCards } from "@/lib/data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

const sections = [
  "Sobre mí",
  "Preferencias",
  "Bonos",
  "Tarjetas regalo",
  "Pagos",
  "Recordatorios",
  "Notificaciones",
  "Reseñas",
  "Privacidad",
  "Idioma",
  "Ayuda",
] as const;

type Section = (typeof sections)[number];

export function Profile() {
  const store = useStore();
  const me = clientById(CURRENT_CLIENT);
  const [section, setSection] = useState<Section | null>(null);
  const [about, setAbout] = useState(me?.about ?? "");
  const [reminders, setReminders] = useState({ h24: true, h2: true });
  const [notices, setNotices] = useState({ reservas: true, ofertas: true, muro: false });
  const [faceId, setFaceId] = useState(true);
  const [language, setLanguage] = useState("Español");

  return (
    <div className="px-5 pt-6">
      <h1 className="font-serif text-4xl">Perfil</h1>
      <p className="mt-2 text-sm text-mute">{me?.name} · {me?.email}</p>
      <ul className="mt-5 overflow-hidden rounded-3xl bg-card ring-1 ring-line">
        {sections.map((item) => (
          <li key={item} className="border-b border-line last:border-0">
            <button type="button" onClick={() => setSection(item)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm">
              {item}
              <span className="text-mute">→</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => store.logout()} className="mt-4 text-sm text-copper">
        Cerrar sesión
      </button>

      {section ? (
        <div className="ios-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/55">
          <div className="max-h-[88dvh] w-full max-w-[480px] overflow-auto rounded-t-3xl bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-3xl">{section}</h2>
              <button type="button" onClick={() => setSection(null)} className="text-sm text-mute">
                Cerrar
              </button>
            </div>
            {section === "Sobre mí" ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  store.notify("Guardado en este dispositivo.");
                  setSection(null);
                }}
              >
                <textarea value={about} onChange={(event) => setAbout(event.target.value)} rows={4} className="w-full rounded-2xl border border-line bg-paper p-3 text-sm outline-none" />
                <button type="submit" className="mt-3 w-full rounded-full bg-ink py-3 text-sm text-paper">Guardar</button>
              </form>
            ) : null}
            {section === "Preferencias" ? (
              <div className="text-sm leading-6">
                {store.prefs ? (
                  <p>
                    Buscas {store.prefs.category.toLowerCase()}, te importa la {store.prefs.value} y la distancia es «{store.prefs.distance}».
                  </p>
                ) : (
                  <p>Todavía no has contestado el cuestionario. Vuelve a Inicio y espera un momento, o restablece la maqueta.</p>
                )}
                <button
                  type="button"
                  onClick={() => store.reset()}
                  className="mt-4 text-copper"
                >
                  Restablecer maqueta
                </button>
              </div>
            ) : null}
            {section === "Bonos" ? (
              <p className="text-sm leading-6">Bono 5 cortes en Sublime. Te quedan {store.bonusLeft} usos. Se aplica al confirmar un corte.</p>
            ) : null}
            {section === "Tarjetas regalo" ? (
              <ul className="flex flex-col gap-2 text-sm">
                {giftCards.map((card) => (
                  <li key={card.code} className="rounded-2xl bg-paper p-3">
                    <p className="font-medium">{card.code}</p>
                    <p>De {card.from} · saldo {money(card.balance)}</p>
                    <p className="text-mute">{card.message}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            {section === "Pagos" ? (
              <p className="text-sm leading-6">Visa ···· 4242 y Apple Pay. El cobro real iría por Stripe. Aquí no se guarda ninguna tarjeta.</p>
            ) : null}
            {section === "Recordatorios" ? (
              <div className="flex flex-col gap-2 text-sm">
                <Toggle label="WhatsApp 24 h antes" checked={reminders.h24} onChange={(checked) => setReminders({ ...reminders, h24: checked })} />
                <Toggle label="WhatsApp 2 h antes" checked={reminders.h2} onChange={(checked) => setReminders({ ...reminders, h2: checked })} />
                <p className="text-mute">Si no hay WhatsApp, el aviso sale por SMS. Responder 1 confirma y 2 pide un cambio.</p>
              </div>
            ) : null}
            {section === "Notificaciones" ? (
              <div className="flex flex-col gap-2 text-sm">
                <Toggle label="Reservas" checked={notices.reservas} onChange={(checked) => setNotices({ ...notices, reservas: checked })} />
                <Toggle label="Ofertas" checked={notices.ofertas} onChange={(checked) => setNotices({ ...notices, ofertas: checked })} />
                <Toggle label="Muro de favoritos" checked={notices.muro} onChange={(checked) => setNotices({ ...notices, muro: checked })} />
              </div>
            ) : null}
            {section === "Reseñas" ? (
              <p className="text-sm leading-6">En agosto dejaste 4 estrellas a Sublime: «Marcos me dejó el corte justo. El sábado se llena, mejor entre semana.»</p>
            ) : null}
            {section === "Privacidad" ? (
              <div className="flex flex-col gap-3 text-sm leading-6">
                <Toggle label="Face ID en este dispositivo" checked={faceId} onChange={setFaceId} />
                <p>Los datos de la maqueta viven en este navegador. En el producto irían cifrados en la UE, con exportación y borrado.</p>
                <button type="button" onClick={() => store.notify("Simulado: prepararíamos un archivo con tus datos.")} className="rounded-full border border-line py-2">
                  Exportar mis datos
                </button>
                <button type="button" onClick={() => store.notify("Simulado: la cuenta no se borra en la maqueta.")} className="rounded-full border border-line py-2">
                  Eliminar cuenta
                </button>
              </div>
            ) : null}
            {section === "Idioma" ? (
              <div className="flex flex-col gap-2">
                {["Español", "Català", "English"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setLanguage(item);
                      store.notify(item === "Español" ? "Idioma: español." : "Guardado. La maqueta sigue escrita en español.");
                    }}
                    className={`rounded-2xl px-3 py-3 text-left text-sm ${language === item ? "bg-ink text-paper" : "bg-card ring-1 ring-line"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
            {section === "Ayuda" ? (
              <div className="flex flex-col gap-3 text-sm leading-6">
                <p><strong>Cancelar.</strong> Gratis hasta 12 h antes. Después se queda la señal.</p>
                <p><strong>Cambiar.</strong> Hasta 6 h antes, si hay otro hueco.</p>
                <p><strong>Lista de espera.</strong> Si aceptas el hueco, tienes 15 minutos.</p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => store.setTheme(store.theme === "light" ? "dark" : "light")}
              className="mt-5 text-sm text-copper"
            >
              {store.theme === "light" ? "Ver en oscuro" : "Ver en claro"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-2xl bg-paper px-3 py-3 text-left"
    >
      {label}
      <span className={`rounded-full px-2 py-1 text-xs ${checked ? "bg-moss text-paper" : "bg-line text-mute"}`}>
        {checked ? "Sí" : "No"}
      </span>
    </button>
  );
}
