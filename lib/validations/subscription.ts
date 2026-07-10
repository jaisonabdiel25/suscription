import { z } from "zod";

export const CATEGORIES = [
  "STREAMING",
  "MUSICA",
  "PRODUCTIVIDAD",
  "EDUCACION",
  "SALUD",
  "GAMING",
  "OTROS",
] as const;

export const IMPORTANCES = ["BAJA", "MEDIA", "ALTA"] as const;

export const BILLING_CYCLES = ["MONTHLY", "ANNUAL"] as const;

export const SUBSCRIPTION_STATUSES = ["ACTIVE", "PAUSED"] as const;

export const CURRENCIES = ["COP", "USD", "EUR"] as const;

export const subscriptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  category: z.enum(CATEGORIES, { message: "Selecciona una categoría" }),
  paymentDay: z.coerce
    .number({ message: "El día de pago es obligatorio" })
    .int("Debe ser un día del mes válido")
    .min(1, "El día debe estar entre 1 y 31")
    .max(31, "El día debe estar entre 1 y 31"),
  importance: z.enum(IMPORTANCES, { message: "Selecciona la importancia" }),
  price: z.coerce
    .number({ message: "El precio es obligatorio" })
    .positive("El precio debe ser mayor que 0"),
  currency: z.enum(CURRENCIES, { message: "Selecciona la moneda" }),
  billingCycle: z.enum(BILLING_CYCLES, { message: "Selecciona el ciclo" }),
  status: z.enum(SUBSCRIPTION_STATUSES, { message: "Selecciona el estado" }),
  notes: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .nullish()
    .transform((value) => (value ? value : null)),
  url: z
    .url("La URL no es válida")
    .or(z.literal(""))
    .nullish()
    .transform((value) => (value ? value : null)),
});

export type SubscriptionInput = z.output<typeof subscriptionSchema>;
