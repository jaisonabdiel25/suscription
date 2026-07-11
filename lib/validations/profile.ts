import { z } from "zod";

export const CURRENCIES = ["COP", "USD", "EUR"] as const;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  currency: z.enum(CURRENCIES, { message: "Selecciona la moneda" }),
});

export type ProfileInput = z.output<typeof profileSchema>;
