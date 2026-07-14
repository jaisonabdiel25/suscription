import { z } from "zod";

// Esquema de una fila de catálogo (usado por el CRUD de admin). Los códigos se
// normalizan a MAYÚSCULAS para mantener el contrato estable de catalogName/catalogId.
export const catalogSchema = z.object({
  catalogName: z
    .string()
    .trim()
    .min(1, "El catálogo es obligatorio")
    .max(50, "Máximo 50 caracteres")
    .transform((value) => value.toUpperCase()),
  catalogId: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(50, "Máximo 50 caracteres")
    .transform((value) => value.toUpperCase()),
  catalogDescription: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria")
    .max(120, "Máximo 120 caracteres"),
  ln: z
    .string()
    .trim()
    .min(2, "Idioma inválido")
    .max(5, "Idioma inválido")
    .transform((value) => value.toLowerCase()),
  sortOrder: z.coerce
    .number({ message: "El orden debe ser un número" })
    .int("Debe ser un entero")
    .min(0, "No puede ser negativo"),
  isActive: z.boolean(),
});

export type CatalogInput = z.output<typeof catalogSchema>;
