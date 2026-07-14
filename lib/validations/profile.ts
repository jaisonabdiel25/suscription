import { z } from "zod";

// La lista de monedas vive en la tabla `catalog` (catalogName = CURRENCY). Aquí
// solo se exige un código; su validez se verifica en el server action.
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  currency: z.string().min(1, "Selecciona la moneda"),
});

export type ProfileInput = z.output<typeof profileSchema>;
