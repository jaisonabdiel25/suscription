import { z } from "zod";

// Los conjuntos de opciones (categoría, importancia, ciclo, estado) viven ahora
// en la tabla `catalog`. Aquí solo se valida que haya un código; su existencia
// contra el catálogo se verifica en el server action. Los códigos de negocio
// (ANNUAL/BIWEEKLY) siguen comparándose por literal en el superRefine.
export const subscriptionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(100, "Máximo 100 caracteres"),
    category: z.string().min(1, "Selecciona una categoría"),
    paymentDay: z.coerce
      .number({ message: "El día de pago es obligatorio" })
      .int("Debe ser un día del mes válido")
      .min(1, "El día debe estar entre 1 y 31")
      .max(31, "El día debe estar entre 1 y 31"),
    // Second payment day, only required for biweekly subscriptions.
    secondPaymentDay: z.preprocess(
      (value) =>
        value === "" || value === null || value === undefined ? null : value,
      z.coerce
        .number()
        .int("Debe ser un día del mes válido")
        .min(1, "El día debe estar entre 1 y 31")
        .max(31, "El día debe estar entre 1 y 31")
        .nullable()
    ),
    // Only required for annual subscriptions; ignored otherwise.
    paymentMonth: z.preprocess(
      (value) =>
        value === "" || value === null || value === undefined ? null : value,
      z.coerce
        .number()
        .int("El mes no es válido")
        .min(1, "El mes debe estar entre 1 y 12")
        .max(12, "El mes debe estar entre 1 y 12")
        .nullable()
    ),
    importance: z.string().min(1, "Selecciona la importancia"),
    price: z.coerce
      .number({ message: "El precio es obligatorio" })
      .positive("El precio debe ser mayor que 0"),
    billingCycle: z.string().min(1, "Selecciona el ciclo"),
    status: z.string().min(1, "Selecciona el estado"),
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
  })
  .superRefine((data, ctx) => {
    if (data.billingCycle === "ANNUAL" && data.paymentMonth === null) {
      ctx.addIssue({
        code: "custom",
        path: ["paymentMonth"],
        message: "Selecciona el mes de pago",
      });
    }
    if (data.billingCycle === "BIWEEKLY") {
      if (data.secondPaymentDay === null) {
        ctx.addIssue({
          code: "custom",
          path: ["secondPaymentDay"],
          message: "Indica el segundo día de pago",
        });
      } else if (data.secondPaymentDay === data.paymentDay) {
        ctx.addIssue({
          code: "custom",
          path: ["secondPaymentDay"],
          message: "Los dos días deben ser distintos",
        });
      }
    }
  })
  // The extra day/month fields only apply to their cycle; drop them otherwise so
  // the data stays consistent when the cycle is changed during an edit.
  .transform((data) => ({
    ...data,
    paymentMonth: data.billingCycle === "ANNUAL" ? data.paymentMonth : null,
    secondPaymentDay:
      data.billingCycle === "BIWEEKLY" ? data.secondPaymentDay : null,
  }));

export type SubscriptionInput = z.output<typeof subscriptionSchema>;
