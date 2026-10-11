export const TODAY = "2026-10-11";
export const NOW = new Date("2026-10-11T12:00:00");

export function money(value: number) {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export function formatLong(date: string) {
  const label = new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatShort(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function formatTime(iso: string) {
  return iso.slice(11, 16);
}

export function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  const month = String(next.getMonth() + 1).padStart(2, "0");
  const day = String(next.getDate()).padStart(2, "0");
  return `${next.getFullYear()}-${month}-${day}`;
}

export function monthCells(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const pad = (first.getDay() + 6) % 7;
  const count = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: pad }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  }
  return cells;
}

export function weekday(date: string) {
  return new Date(`${date}T12:00:00`).getDay();
}

export function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

export function labelFromMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function beforeDeadline(start: string, hours: number) {
  return NOW.getTime() <= new Date(start).getTime() - hours * 60 * 60 * 1000;
}

export const STATUS_LABEL: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  confirmada: "Confirmada",
  cambiada: "Cambiada",
  cancelada: "Cancelada",
  no_vino: "No vino",
  en_curso: "En curso",
  completada: "Completada",
};
