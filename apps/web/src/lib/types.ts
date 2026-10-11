export type Category = "Barbería" | "Color" | "Estética" | "Uñas";

export type PayMethod = "local" | "app" | "senal" | "bono";

export type AppointmentStatus =
  | "pendiente_pago"
  | "confirmada"
  | "cambiada"
  | "cancelada"
  | "no_vino"
  | "en_curso"
  | "completada";

export type Origin = "app" | "ia" | "manual" | "whatsapp";

export type Appointment = {
  id: string;
  businessId: string;
  professionalId: string;
  serviceId: string;
  clientId: string;
  start: string;
  duration: number;
  status: AppointmentStatus;
  payment: PayMethod;
  amount: number;
  origin: Origin;
};

export type Prefs = {
  category: Category;
  value: "rapidez" | "atencion" | "precio" | "valoracion";
  distance: "cerca" | "da-igual" | "lejos";
};

export type WaitItem = {
  id: string;
  businessId: string;
  clientId: string;
  date: string;
  professionalId: string | null;
  band: "manana" | "tarde" | "cualquiera";
  status: "esperando" | "avisado" | "aceptado";
};

export type Offer = {
  businessId: string;
  date: string;
  from: string;
  to: string;
  discount: number;
  note: string;
};
