import { fullDates, proById, prosOf, serviceById } from "./data";
import {
  TODAY,
  minutes,
  weekday,
} from "./format";
import type { Appointment, AppointmentStatus, Prefs } from "./types";
import { businesses } from "./data";

export const OPEN = 10 * 60;
export const CLOSE = 20 * 60;
export const STEP = 30;

const BLOCKING: AppointmentStatus[] = [
  "pendiente_pago",
  "confirmada",
  "cambiada",
  "en_curso",
  "completada",
  "no_vino",
];

export type DayTone = "alta" | "media" | "baja" | "lleno" | "cerrado" | "pasado";

export function isSunday(date: string) {
  return weekday(date) === 0;
}

export function onVacation(proId: string, date: string) {
  const pro = proById(proId);
  if (!pro?.vacation) return false;
  return date >= pro.vacation.from && date <= pro.vacation.to;
}

function interval(appointment: Appointment) {
  const [date, time] = appointment.start.split("T");
  const start = minutes(time);
  return { date, start, end: start + appointment.duration };
}

export function slotFree(options: {
  businessId: string;
  proId: string;
  date: string;
  start: number;
  duration: number;
  appointments: Appointment[];
}) {
  const { businessId, proId, date, start, duration, appointments } = options;
  if (date < TODAY || isSunday(date)) return false;
  if (businessId === "sublime" && fullDates.includes(date)) return false;
  const pro = proById(proId);
  if (!pro || pro.businessId !== businessId) return false;
  if (onVacation(proId, date)) return false;
  if (start < OPEN || start + duration > CLOSE) return false;
  const end = start + duration;
  return !appointments.some((appointment) => {
    if (!BLOCKING.includes(appointment.status)) return false;
    if (appointment.professionalId !== proId) return false;
    const slot = interval(appointment);
    if (slot.date !== date) return false;
    return start < slot.end && end > slot.start;
  });
}

export function prosForService(serviceId: string) {
  const service = serviceById(serviceId);
  if (!service) return [];
  return service.proIds
    .map((id) => proById(id))
    .filter((pro): pro is NonNullable<typeof pro> => Boolean(pro));
}

export function startTimes(options: {
  businessId: string;
  date: string;
  duration: number;
  appointments: Appointment[];
  proId?: string;
}) {
  const times: number[] = [];
  for (let start = OPEN; start + options.duration <= CLOSE; start += STEP) {
    const pros = options.proId
      ? [options.proId]
      : prosOf(options.businessId).map((pro) => pro.id);
    const free = pros.some((proId) =>
      slotFree({ ...options, proId, start }),
    );
    if (free) times.push(start);
  }
  return times;
}

export function dayTone(
  businessId: string,
  date: string,
  appointments: Appointment[],
): DayTone {
  if (date < TODAY) return "pasado";
  if (isSunday(date)) return "cerrado";
  if (fullDates.includes(date) && businessId === "sublime") return "lleno";
  const ratio = freeRatio(businessId, date, appointments);
  if (ratio === null) return "cerrado";
  if (ratio === 0) return "lleno";
  if (ratio >= 0.6) return "alta";
  if (ratio >= 0.3) return "media";
  return "baja";
}

export function occupancy(
  businessId: string,
  date: string,
  appointments: Appointment[],
) {
  if (isSunday(date)) return null;
  if (fullDates.includes(date) && businessId === "sublime") return 100;
  const ratio = freeRatio(businessId, date, appointments, true);
  if (ratio === null) return null;
  return Math.round((1 - ratio) * 100);
}

function isTaken(
  proId: string,
  date: string,
  start: number,
  appointments: Appointment[],
) {
  return appointments.some((appointment) => {
    if (!BLOCKING.includes(appointment.status)) return false;
    if (appointment.professionalId !== proId) return false;
    const slot = interval(appointment);
    return slot.date === date && start < slot.end && start + STEP > slot.start;
  });
}

function freeRatio(
  businessId: string,
  date: string,
  appointments: Appointment[],
  includePast = false,
) {
  if (!includePast && date < TODAY) return null;
  if (isSunday(date)) return null;
  const pros = prosOf(businessId).filter((pro) => !onVacation(pro.id, date));
  if (pros.length === 0) return null;
  if (fullDates.includes(date) && businessId === "sublime") return 0;
  let total = 0;
  let free = 0;
  for (const pro of pros) {
    for (let start = OPEN; start < CLOSE; start += STEP) {
      total += 1;
      const taken = isTaken(pro.id, date, start, appointments);
      if (!taken) free += 1;
    }
  }
  if (total === 0) return null;
  return free / total;
}

export function leastLoadedPro(options: {
  businessId: string;
  serviceId: string;
  date: string;
  start: number;
  duration: number;
  appointments: Appointment[];
}) {
  const candidates = prosForService(options.serviceId).filter((pro) =>
    slotFree({
      businessId: options.businessId,
      proId: pro.id,
      date: options.date,
      start: options.start,
      duration: options.duration,
      appointments: options.appointments,
    }),
  );
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => {
    const load = (id: string) =>
      options.appointments
        .filter(
          (appointment) =>
            BLOCKING.includes(appointment.status) &&
            appointment.professionalId === id &&
            appointment.start.startsWith(options.date),
        )
        .reduce((sum, appointment) => sum + appointment.duration, 0);
    return load(a.id) - load(b.id);
  })[0];
}

export function isFirst(
  clientId: string,
  businessId: string,
  appointments: Appointment[],
) {
  return !appointments.some(
    (appointment) =>
      appointment.clientId === clientId &&
      appointment.businessId === businessId &&
      appointment.status === "completada",
  );
}

export function clientStats(
  clientId: string,
  businessId: string,
  appointments: Appointment[],
) {
  const mine = appointments.filter(
    (appointment) =>
      appointment.clientId === clientId && appointment.businessId === businessId,
  );
  const completed = mine.filter((appointment) => appointment.status === "completada");
  const spent = completed.reduce((sum, appointment) => sum + appointment.amount, 0);
  const absences = mine.filter((appointment) => appointment.status === "no_vino").length;
  const last = [...completed].sort((a, b) => (a.start < b.start ? 1 : -1))[0];
  return {
    visits: completed.length,
    spent,
    absences,
    last: last?.start.slice(0, 10) ?? null,
    upcoming: mine.filter(
      (appointment) =>
        appointment.start.slice(0, 10) >= TODAY &&
        ["confirmada", "pendiente_pago", "en_curso", "cambiada"].includes(
          appointment.status,
        ),
    ),
  };
}

export function affinity(
  business: (typeof businesses)[number],
  prefs: Prefs | null,
) {
  if (!prefs) return business.baseAffinity;
  let score = 38;
  if (prefs.category === business.category) score += 28;
  if (prefs.value === "valoracion") score += Math.round(business.rating * 6);
  if (prefs.value === "precio") score += Math.round(business.priceScore / 5);
  if (prefs.value === "rapidez") score += Math.round(business.speedScore / 5);
  if (prefs.value === "atencion") score += Math.round(business.careScore / 5);
  if (prefs.distance === "cerca") score += Math.max(0, 16 - business.distanceKm * 4);
  if (prefs.distance === "da-igual") score += 6;
  if (prefs.distance === "lejos") score += 4;
  return Math.max(35, Math.min(99, score));
}

export function weekDays(anchor: string) {
  const date = new Date(`${anchor}T12:00:00`);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(date);
    next.setDate(date.getDate() + index);
    const month = String(next.getMonth() + 1).padStart(2, "0");
    const day = String(next.getDate()).padStart(2, "0");
    return `${next.getFullYear()}-${month}-${day}`;
  });
}

export function slowDays(
  businessId: string,
  from: string,
  appointments: Appointment[],
  threshold = 40,
) {
  const days: { date: string; percent: number }[] = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(`${from}T12:00:00`);
    date.setDate(date.getDate() + index);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const iso = `${date.getFullYear()}-${month}-${day}`;
    if (iso < TODAY || isSunday(iso)) continue;
    const percent = occupancy(businessId, iso, appointments);
    if (percent !== null && percent <= threshold) days.push({ date: iso, percent });
  }
  return days;
}
