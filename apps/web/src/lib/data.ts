import type { Appointment } from "./types";

export const CURRENT_CLIENT = "lucia";
export const BUSINESS_ID = "sublime";

export const categories = ["Barbería", "Color", "Estética", "Uñas"] as const;

export const businesses = [
  {
    id: "sublime",
    name: "Sublime Barber Studio",
    category: "Barbería" as const,
    neighborhood: "Ruzafa",
    city: "València",
    address: "Carrer de Cadis 18",
    distanceKm: 0.8,
    rating: 4.9,
    reviewCount: 186,
    priceScore: 62,
    speedScore: 88,
    careScore: 84,
    baseAffinity: 86,
    phone: "+34 963 12 18 40",
    instagram: "@sublime.barber",
    cover: "linear-gradient(150deg, #241c17 0%, #7a3e2c 58%, #d7b48a 140%)",
    blurb: "Corte, barba y un rato sin prisa.",
    about:
      "Estudio de dos plantas en Ruzafa. Cortes clásicos y degradados, barba con toalla caliente y color cuando Inés está.",
    hours: "Lunes a sábado, 10:00–20:00",
    lat: 39.4604,
    lng: -0.3746,
  },
  {
    id: "atelier",
    name: "Atelier Luna",
    category: "Color" as const,
    neighborhood: "Eixample",
    city: "València",
    address: "Carrer de Ciril Amorós 52",
    distanceKm: 1.6,
    rating: 4.8,
    reviewCount: 124,
    priceScore: 48,
    speedScore: 60,
    careScore: 94,
    baseAffinity: 78,
    phone: "+34 960 44 21 09",
    instagram: "@atelier.luna",
    cover: "linear-gradient(160deg, #3a2a31 0%, #a35b68 70%, #f0d2c4 140%)",
    blurb: "Color, mechas y diagnósticos sin receta genérica.",
    about:
      "Trabajan por cita cerrada. Cada color empieza con una prueba de mecha si el cabello está tratado.",
    hours: "Martes a sábado, 10:00–20:00",
    lat: 39.4672,
    lng: -0.3694,
  },
  {
    id: "nora",
    name: "Estudio Nora",
    category: "Estética" as const,
    neighborhood: "El Carmen",
    city: "València",
    address: "Carrer de Baix 9",
    distanceKm: 2.1,
    rating: 4.7,
    reviewCount: 93,
    priceScore: 70,
    speedScore: 74,
    careScore: 90,
    baseAffinity: 74,
    phone: "+34 961 08 33 20",
    instagram: "@estudionora",
    cover: "linear-gradient(155deg, #1d2a26 0%, #3f6b58 62%, #d7c4a4 140%)",
    blurb: "Piel, cejas y tratamientos cortos entre semana.",
    about:
      "Cabina individual. Si vienes por primera vez, reservan diez minutos extra de ficha.",
    hours: "Lunes a viernes, 10:00–20:00",
    lat: 39.4788,
    lng: -0.3808,
  },
  {
    id: "casaverde",
    name: "Casa Verde",
    category: "Uñas" as const,
    neighborhood: "Benimaclet",
    city: "València",
    address: "Carrer de Murta 4",
    distanceKm: 3.4,
    rating: 4.6,
    reviewCount: 71,
    priceScore: 80,
    speedScore: 82,
    careScore: 76,
    baseAffinity: 69,
    phone: "+34 962 21 77 15",
    instagram: "@casaverde.nails",
    cover: "linear-gradient(150deg, #243024 0%, #6d8a52 60%, #e4d7b8 130%)",
    blurb: "Manicura, semipermanente y nail art con huecos reales.",
    about: "Dos puestos. El esmaltado semipermanente dura unos 45 minutos.",
    hours: "Lunes a sábado, 10:00–20:00",
    lat: 39.4862,
    lng: -0.3619,
  },
];

export const professionals = [
  {
    id: "javi",
    businessId: "sublime",
    name: "Javi Navarro",
    role: "propietario" as const,
    title: "Master barber",
    bio: "Cortes clásicos y barba. Lleva el estudio desde 2016.",
    commission: 0,
    color: "#7a3e2c",
    vacation: null as null | { from: string; to: string },
  },
  {
    id: "marcos",
    businessId: "sublime",
    name: "Marcos Gil",
    role: "empleado" as const,
    title: "Barbero",
    bio: "Degradados y cortes que aguantan la semana.",
    commission: 40,
    color: "#2f4a3c",
    vacation: null,
  },
  {
    id: "ines",
    businessId: "sublime",
    name: "Inés Roura",
    role: "empleado" as const,
    title: "Colorista",
    bio: "Color y mechas. Fuera del estudio del 20 al 24 de octubre.",
    commission: 45,
    color: "#6d3a4e",
    vacation: { from: "2026-10-20", to: "2026-10-24" },
  },
  {
    id: "luna",
    businessId: "atelier",
    name: "Luna Ferrer",
    role: "propietario" as const,
    title: "Colorista",
    bio: "Rubios, correcciones y cambios de imagen.",
    commission: 0,
    color: "#a35b68",
    vacation: null,
  },
  {
    id: "vera",
    businessId: "nora",
    name: "Vera Soler",
    role: "propietario" as const,
    title: "Esteticista",
    bio: "Faciales cortos y diseño de cejas.",
    commission: 0,
    color: "#3f6b58",
    vacation: null,
  },
  {
    id: "noa",
    businessId: "casaverde",
    name: "Noa Vidal",
    role: "propietario" as const,
    title: "Nail artist",
    bio: "Semipermanente y diseños pequeños.",
    commission: 0,
    color: "#6d8a52",
    vacation: null,
  },
];

export const services = [
  {
    id: "corte",
    businessId: "sublime",
    name: "Corte clásico",
    description: "Lavado, corte y peinado. Dura un mes si te sienta bien.",
    price: 28,
    duration: 30,
    consent: false,
    proIds: ["javi", "marcos"],
  },
  {
    id: "barba",
    businessId: "sublime",
    name: "Arreglo de barba",
    description: "Perfilado, toalla caliente y aceite.",
    price: 16,
    duration: 30,
    consent: false,
    proIds: ["javi", "marcos"],
  },
  {
    id: "corte-barba",
    businessId: "sublime",
    name: "Corte y barba",
    description: "Las dos cosas, seguidas, con el mismo profesional.",
    price: 40,
    duration: 60,
    consent: false,
    proIds: ["javi", "marcos"],
  },
  {
    id: "color",
    businessId: "sublime",
    name: "Color",
    description: "Raíz o color completo. Hace falta firma de consentimiento.",
    price: 55,
    duration: 90,
    consent: true,
    proIds: ["ines"],
  },
  {
    id: "mechas",
    businessId: "sublime",
    name: "Mechas",
    description: "Mechas finas o balayage. También pide firma.",
    price: 85,
    duration: 120,
    consent: true,
    proIds: ["ines"],
  },
  {
    id: "color-luna",
    businessId: "atelier",
    name: "Color completo",
    description: "Diagnóstico, color y secado.",
    price: 78,
    duration: 120,
    consent: true,
    proIds: ["luna"],
  },
  {
    id: "mechas-luna",
    businessId: "atelier",
    name: "Mechas babylights",
    description: "Mechas finas y matiz.",
    price: 120,
    duration: 150,
    consent: true,
    proIds: ["luna"],
  },
  {
    id: "facial",
    businessId: "nora",
    name: "Facial express",
    description: "Limpieza e hidratación en 45 minutos.",
    price: 42,
    duration: 45,
    consent: false,
    proIds: ["vera"],
  },
  {
    id: "cejas",
    businessId: "nora",
    name: "Diseño de cejas",
    description: "Depilación y dibujo.",
    price: 18,
    duration: 30,
    consent: false,
    proIds: ["vera"],
  },
  {
    id: "mani",
    businessId: "casaverde",
    name: "Semipermanente",
    description: "Manicura y esmaltado.",
    price: 32,
    duration: 45,
    consent: false,
    proIds: ["noa"],
  },
  {
    id: "nailart",
    businessId: "casaverde",
    name: "Nail art",
    description: "Diseño en dos uñas o francés decorado.",
    price: 40,
    duration: 60,
    consent: false,
    proIds: ["noa"],
  },
];

export const clients = [
  {
    id: "lucia",
    name: "Lucía Marín",
    phone: "+34 600 112 334",
    email: "lucia.marin@email.com",
    primary: true,
    trust: "alta" as const,
    memberSince: "2024-03-12",
    about: "Llevo el corte a la altura de la mandíbula. Sin perfumes fuertes.",
  },
  {
    id: "hugo",
    name: "Hugo Paredes",
    phone: "+34 611 204 883",
    email: "hugo.paredes@email.com",
    primary: true,
    trust: "media" as const,
    memberSince: "2026-10-08",
    about: "Primera visita. Viene recomendado por Marta.",
  },
  {
    id: "marta",
    name: "Marta Soler",
    phone: "+34 622 908 114",
    email: "marta.soler@email.com",
    primary: true,
    trust: "alta" as const,
    memberSince: "2023-11-02",
    about: "Color cada ocho semanas. Prefiere a Inés.",
  },
  {
    id: "andres",
    name: "Andrés Vidal",
    phone: "+34 633 441 220",
    email: "andres.vidal@email.com",
    primary: true,
    trust: "media" as const,
    memberSince: "2025-01-19",
    about: "Corte y barba. Suele llegar justo.",
  },
  {
    id: "elena",
    name: "Elena Ruiz",
    phone: "+34 644 778 901",
    email: "elena.ruiz@email.com",
    primary: true,
    trust: "baja" as const,
    memberSince: "2025-06-03",
    about: "Una ausencia en septiembre. La señal no se devolvió.",
  },
  {
    id: "raul",
    name: "Raúl Serra",
    phone: "+34 655 013 772",
    email: "raul.serra@email.com",
    primary: true,
    trust: "baja" as const,
    memberSince: "2024-08-22",
    about: "Bloqueado por el estudio tras dos ausencias seguidas.",
  },
  { id: "pau", name: "Pau León", phone: "", email: "", primary: false, trust: "media" as const, memberSince: "2025-04-01", about: "" },
  { id: "diego", name: "Diego Salas", phone: "", email: "", primary: false, trust: "media" as const, memberSince: "2025-05-11", about: "" },
  { id: "sofia", name: "Sofía Navarro", phone: "", email: "", primary: false, trust: "alta" as const, memberSince: "2024-12-09", about: "" },
  { id: "omar", name: "Omar Benítez", phone: "", email: "", primary: false, trust: "media" as const, memberSince: "2026-02-14", about: "" },
  { id: "rita", name: "Rita Costa", phone: "", email: "", primary: false, trust: "alta" as const, memberSince: "2023-09-30", about: "" },
  { id: "carla", name: "Carla Méndez", phone: "", email: "", primary: false, trust: "media" as const, memberSince: "2026-01-07", about: "" },
];

export const products = [
  { id: "cera", businessId: "sublime", name: "Cera mate", price: 18, stock: 14, commission: 10 },
  { id: "champu", businessId: "sublime", name: "Champú de uso diario", price: 16, stock: 9, commission: 10 },
  { id: "aceite", businessId: "sublime", name: "Aceite de barba", price: 22, stock: 6, commission: 15 },
];

export const reviews = [
  { id: "r1", businessId: "sublime", author: "Marta Soler", rating: 5, text: "Inés clava el tono. Salí sin el naranja de la otra vez.", date: "2026-09-18" },
  { id: "r2", businessId: "sublime", author: "Andrés Vidal", rating: 5, text: "Javi tarda lo que dice. La barba queda limpia una semana.", date: "2026-09-02" },
  { id: "r3", businessId: "sublime", author: "Lucía Marín", rating: 4, text: "Marcos me dejó el corte justo. El sábado se llena, mejor entre semana.", date: "2026-08-21" },
  { id: "r4", businessId: "atelier", author: "Clara", rating: 5, text: "Me explicaron el mantenimiento antes de decolorar.", date: "2026-09-11" },
  { id: "r5", businessId: "nora", author: "Helena", rating: 5, text: "El facial express cabe en la hora de comer.", date: "2026-08-30" },
  { id: "r6", businessId: "casaverde", author: "Nuria", rating: 4, text: "Puntuales y el esmalte aguantó tres semanas.", date: "2026-09-05" },
];

export const wall = [
  {
    id: "w1",
    businessId: "sublime",
    author: "Javi Navarro",
    text: "Inés está de vacaciones del 20 al 24 de octubre. El color y las mechas vuelven el lunes 26.",
    pinned: true,
    vacation: { professionalId: "ines", from: "2026-10-20", to: "2026-10-24" },
  },
  {
    id: "w2",
    businessId: "sublime",
    author: "Javi Navarro",
    text: "El sábado 17 la agenda está completa. Si se libera un hueco, avisamos a la lista de espera.",
    pinned: false,
  },
  {
    id: "w3",
    businessId: "atelier",
    author: "Luna Ferrer",
    text: "Esta semana solo aceptamos correcciones de color con prueba de mecha.",
    pinned: true,
  },
];

export const works = [
  { id: "k1", businessId: "sublime", professionalId: "marcos", title: "Degradado bajo", caption: "Dos semanas después sigue en su sitio.", tone: "linear-gradient(165deg, #2a211c, #8a4b34 70%, #e6d3bc)", kind: "reel" as const },
  { id: "k2", businessId: "sublime", professionalId: "ines", title: "Cobrizo suave", caption: "Color de raíz a puntas, sin mechas.", tone: "linear-gradient(160deg, #4a2c2c, #b45a46 60%, #f0d2bf)", kind: "foto" as const },
  { id: "k3", businessId: "sublime", professionalId: "javi", title: "Barba corta", caption: "Línea de mandíbula y patilla corta.", tone: "linear-gradient(155deg, #1c1916, #5c5148 80%)", kind: "foto" as const },
  { id: "k4", businessId: "atelier", professionalId: "luna", title: "Babylights", caption: "Rubio frío sobre castaño.", tone: "linear-gradient(165deg, #3a3034, #c48b93 65%, #f6e4dc)", kind: "reel" as const },
  { id: "k5", businessId: "nora", professionalId: "vera", title: "Cejas laminadas", caption: "Diseño suave, sin bloque.", tone: "linear-gradient(160deg, #24302c, #6d9080)", kind: "foto" as const },
  { id: "k6", businessId: "casaverde", professionalId: "noa", title: "Verde salvia", caption: "Semipermanente mate.", tone: "linear-gradient(160deg, #243024, #7d9a62 70%, #efe6cf)", kind: "reel" as const },
];

export const bonuses = [
  { id: "b1", businessId: "sublime", name: "Bono 5 cortes", remaining: 3, total: 5, price: 120 },
];

export const giftCards = [
  { code: "IMAGO-ANNA", businessId: "sublime", from: "Ana", amount: 40, balance: 40, message: "Para el corte que llevas aplazando." },
];

function cita(
  partial: Pick<Appointment, "id" | "professionalId" | "serviceId" | "clientId" | "start" | "duration" | "status" | "payment" | "amount"> &
    Partial<Pick<Appointment, "origin" | "businessId">>,
): Appointment {
  return {
    businessId: "sublime",
    origin: "manual",
    ...partial,
  };
}

function packedDay(date: string): Appointment[] {
  const slots = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];
  const pros = [
    { id: "javi", clients: ["andres", "pau", "diego", "sofia", "omar", "rita"] },
    { id: "marcos", clients: ["rita", "carla", "hugo", "elena", "pau", "diego"] },
    { id: "ines", clients: ["marta", "sofia", "omar", "carla", "andres", "pau"] },
  ];
  return pros.flatMap((pro) =>
    slots.map((time, index) =>
      cita({
        id: `pack-${pro.id}-${date}-${time}`,
        professionalId: pro.id,
        serviceId: pro.id === "ines" ? "color" : "corte-barba",
        clientId: pro.clients[index],
        start: `${date}T${time}`,
        duration: 90,
        status: "confirmada",
        payment: "local",
        amount: pro.id === "ines" ? 55 : 40,
      }),
    ),
  );
}

export const seedAppointments: Appointment[] = [
  cita({ id: "hoy-lucia", professionalId: "marcos", serviceId: "barba", clientId: "lucia", start: "2026-10-11T19:30", duration: 30, status: "confirmada", payment: "senal", amount: 16, origin: "app" }),
  cita({ id: "lun-hugo", professionalId: "marcos", serviceId: "corte", clientId: "hugo", start: "2026-10-12T10:00", duration: 30, status: "confirmada", payment: "senal", amount: 28 }),
  cita({ id: "lun-andres", professionalId: "javi", serviceId: "corte-barba", clientId: "andres", start: "2026-10-12T10:00", duration: 60, status: "confirmada", payment: "local", amount: 40 }),
  cita({ id: "lun-marta", professionalId: "ines", serviceId: "color", clientId: "marta", start: "2026-10-12T10:30", duration: 90, status: "confirmada", payment: "app", amount: 55 }),
  cita({ id: "lun-elena", professionalId: "marcos", serviceId: "corte", clientId: "elena", start: "2026-10-12T11:00", duration: 30, status: "confirmada", payment: "local", amount: 28 }),
  cita({ id: "lun-pau", professionalId: "javi", serviceId: "barba", clientId: "pau", start: "2026-10-12T12:00", duration: 30, status: "confirmada", payment: "local", amount: 16 }),
  cita({ id: "lun-diego", professionalId: "marcos", serviceId: "corte", clientId: "diego", start: "2026-10-12T13:00", duration: 30, status: "confirmada", payment: "app", amount: 28 }),
  cita({ id: "lun-sofia", professionalId: "javi", serviceId: "corte", clientId: "sofia", start: "2026-10-12T16:30", duration: 30, status: "confirmada", payment: "local", amount: 28 }),
  cita({ id: "lun-omar", professionalId: "ines", serviceId: "mechas", clientId: "omar", start: "2026-10-12T16:00", duration: 120, status: "confirmada", payment: "senal", amount: 85 }),
  cita({ id: "lun-rita", professionalId: "marcos", serviceId: "corte", clientId: "rita", start: "2026-10-12T18:00", duration: 30, status: "confirmada", payment: "local", amount: 28 }),
  cita({ id: "mar-sofia", professionalId: "marcos", serviceId: "corte", clientId: "sofia", start: "2026-10-13T11:00", duration: 30, status: "confirmada", payment: "local", amount: 28 }),
  ...packedDay("2026-10-14"),
  cita({ id: "jue-lucia", professionalId: "marcos", serviceId: "barba", clientId: "lucia", start: "2026-10-15T17:30", duration: 30, status: "confirmada", payment: "app", amount: 16, origin: "app" }),
  cita({ id: "vie-pau", professionalId: "javi", serviceId: "corte", clientId: "pau", start: "2026-10-16T12:00", duration: 60, status: "confirmada", payment: "local", amount: 28 }),
  cita({ id: "vie-marta", professionalId: "ines", serviceId: "color", clientId: "marta", start: "2026-10-16T10:00", duration: 90, status: "confirmada", payment: "app", amount: 55 }),
  cita({ id: "past-lucia-1", professionalId: "marcos", serviceId: "corte", clientId: "lucia", start: "2026-09-20T11:00", duration: 30, status: "completada", payment: "app", amount: 28, origin: "app" }),
  cita({ id: "past-lucia-2", professionalId: "javi", serviceId: "barba", clientId: "lucia", start: "2026-09-02T18:00", duration: 30, status: "completada", payment: "local", amount: 16, origin: "app" }),
  cita({ id: "past-elena", professionalId: "marcos", serviceId: "corte", clientId: "elena", start: "2026-09-28T16:00", duration: 30, status: "no_vino", payment: "senal", amount: 10 }),
  cita({ id: "past-marta", professionalId: "ines", serviceId: "color", clientId: "marta", start: "2026-09-18T12:00", duration: 90, status: "completada", payment: "app", amount: 55 }),
  cita({ id: "past-andres", professionalId: "javi", serviceId: "corte-barba", clientId: "andres", start: "2026-09-30T17:00", duration: 60, status: "completada", payment: "local", amount: 40 }),
];

export const seedWaitlist = [
  { id: "wl1", businessId: "sublime", clientId: "pau", date: "2026-10-17", professionalId: "marcos", band: "tarde" as const, status: "esperando" as const },
  { id: "wl2", businessId: "sublime", clientId: "carla", date: "2026-10-17", professionalId: null, band: "cualquiera" as const, status: "esperando" as const },
];

export const fullDates = ["2026-10-17"];

export const invoices = [
  { id: "F-2026-018", period: "Septiembre 2026", amount: 49, state: "Pagada" },
  { id: "F-2026-017", period: "Agosto 2026", amount: 49, state: "Pagada" },
];

export const devices = [
  { id: "d1", name: "iPhone de Javi", last: "Hoy, 09:40", current: true },
  { id: "d2", name: "iPad de recepción", last: "Ayer, 20:05", current: false },
];

export function businessById(id: string) {
  return businesses.find((item) => item.id === id);
}

export function prosOf(businessId: string) {
  return professionals.filter((item) => item.businessId === businessId);
}

export function servicesOf(businessId: string) {
  return services.filter((item) => item.businessId === businessId);
}

export function averagePrice(businessId: string) {
  const items = servicesOf(businessId);
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return Math.round(total / items.length);
}

export function clientById(id: string) {
  return clients.find((item) => item.id === id);
}

export function serviceById(id: string) {
  return services.find((item) => item.id === id);
}

export function proById(id: string) {
  return professionals.find((item) => item.id === id);
}

export function reviewsOf(businessId: string) {
  return reviews.filter((item) => item.businessId === businessId);
}

export function wallOf(businessId: string) {
  return wall.filter((item) => item.businessId === businessId);
}

export function worksOf(businessId?: string) {
  return businessId ? works.filter((item) => item.businessId === businessId) : works;
}
