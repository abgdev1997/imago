"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { bonuses, seedAppointments, seedWaitlist } from "./data";
import type { Appointment, AppointmentStatus, Offer, Prefs, WaitItem } from "./types";

const KEY = "imago-mock-v1";

type State = {
  session: boolean;
  prefs: Prefs | null;
  quizSnoozed: boolean;
  appointments: Appointment[];
  waitlist: WaitItem[];
  favorites: string[];
  savedWorks: string[];
  bonusLeft: number;
  blockedIds: string[];
  notes: Record<string, string>;
  offer: Offer | null;
  theme: "light" | "dark";
  toast: string | null;
};

const initial: State = {
  session: false,
  prefs: null,
  quizSnoozed: false,
  appointments: seedAppointments,
  waitlist: seedWaitlist,
  favorites: ["sublime", "atelier"],
  savedWorks: ["k1"],
  bonusLeft: bonuses[0].remaining,
  blockedIds: ["raul"],
  notes: {
    hugo: "Primera visita. Quiere un degradado bajo y la nuca bien limpia.",
    lucia: "Corte a la mandíbula. Evitar productos con perfume.",
    elena: "Ausencia el 28 de septiembre. Se quedó la señal.",
    marta: "Color cada ocho semanas. Solo con Inés.",
  },
  offer: null,
  theme: "dark",
  toast: null,
};

type Store = State & {
  enter: () => void;
  logout: () => void;
  savePrefs: (prefs: Prefs) => void;
  snoozeQuiz: () => void;
  toggleFavorite: (id: string) => void;
  toggleSaved: (id: string) => void;
  book: (appointment: Appointment) => void;
  setStatus: (id: string, status: AppointmentStatus) => void;
  joinWaitlist: (item: WaitItem) => void;
  setNote: (clientId: string, note: string) => void;
  toggleBlocked: (clientId: string) => void;
  publishOffer: (offer: Offer) => void;
  useBonus: () => void;
  setTheme: (theme: "light" | "dark") => void;
  notify: (message: string) => void;
  reset: () => void;
};

let state = initial;
const listeners = new Set<() => void>();
const Ctx = createContext<Store | null>(null);

function persistable(value: State) {
  return {
    session: value.session,
    prefs: value.prefs,
    appointments: value.appointments,
    waitlist: value.waitlist,
    favorites: value.favorites,
    savedWorks: value.savedWorks,
    bonusLeft: value.bonusLeft,
    blockedIds: value.blockedIds,
    notes: value.notes,
    offer: value.offer,
    theme: value.theme,
  };
}

function emit(next: State) {
  state = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(persistable(next)));
    document.documentElement.dataset.theme = next.theme;
  }
  listeners.forEach((listener) => listener());
}

function load() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Partial<State>;
    state = {
      ...initial,
      ...parsed,
      toast: null,
      quizSnoozed: Boolean(parsed.prefs),
    };
  } catch {
    localStorage.removeItem(KEY);
  }
}

load();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readSession() {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    return Boolean((JSON.parse(raw) as Partial<State>).session);
  } catch {
    return false;
  }
}

function patch(partial: Partial<State>) {
  emit({ ...state, ...partial });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => initial);

  useEffect(() => {
    document.documentElement.dataset.theme = snapshot.theme;
  }, [snapshot.theme]);

  useEffect(() => {
    if (!snapshot.toast) return;
    const timer = window.setTimeout(() => patch({ toast: null }), 3200);
    return () => window.clearTimeout(timer);
  }, [snapshot.toast]);

  const store: Store = {
    ...snapshot,
    enter: () => patch({ session: true }),
    logout: () => patch({ session: false }),
    savePrefs: (prefs) => patch({ prefs, quizSnoozed: true }),
    snoozeQuiz: () => patch({ quizSnoozed: true }),
    toggleFavorite: (id) =>
      patch({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter((item) => item !== id)
          : [...state.favorites, id],
      }),
    toggleSaved: (id) =>
      patch({
        savedWorks: state.savedWorks.includes(id)
          ? state.savedWorks.filter((item) => item !== id)
          : [...state.savedWorks, id],
      }),
    book: (appointment) => patch({ appointments: [...state.appointments, appointment] }),
    setStatus: (id, status) =>
      patch({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status } : appointment,
        ),
      }),
    joinWaitlist: (item) => patch({ waitlist: [...state.waitlist, item] }),
    setNote: (clientId, note) => patch({ notes: { ...state.notes, [clientId]: note } }),
    toggleBlocked: (clientId) =>
      patch({
        blockedIds: state.blockedIds.includes(clientId)
          ? state.blockedIds.filter((item) => item !== clientId)
          : [...state.blockedIds, clientId],
      }),
    publishOffer: (offer) => patch({ offer }),
    useBonus: () => patch({ bonusLeft: Math.max(0, state.bonusLeft - 1) }),
    setTheme: (theme) => patch({ theme }),
    notify: (toast) => patch({ toast }),
    reset: () => {
      localStorage.removeItem(KEY);
      emit({ ...initial });
    },
  };

  return (
    <Ctx.Provider value={store}>
      {children}
      {snapshot.toast ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
          <p
            role="status"
            aria-live="polite"
            className="max-w-md rounded-2xl bg-ink px-4 py-3 text-sm leading-5 text-paper"
          >
            {snapshot.toast}
          </p>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

export function useStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("useStore fuera de Providers");
  return store;
}
