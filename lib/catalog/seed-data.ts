/**
 * Fuente canónica y única de los catálogos. La migración solo crea la tabla;
 * todos los datos entran por `prisma/seed.ts` (upsert idempotente).
 *
 * Los `catalogId` son códigos ESTABLES: la lógica de negocio compara contra
 * ellos (p. ej. ciclo "BIWEEKLY"/"ANNUAL", estado "ACTIVE"). No renombrar sin
 * migrar los datos existentes.
 *
 * Los `id` son FIJOS y forman parte del contrato: garantizan que una misma
 * opción tenga el mismo PK en todos los ambientes. Nunca regenerarlos; para
 * una opción nueva, añadir una línea con un UUID nuevo.
 */

export const CATALOG_NAMES = {
  CATEGORY: "CATEGORY",
  IMPORTANCY: "IMPORTANCY",
  CICLFACT: "CICLFACT",
  STATUS: "STATUS",
  CURRENCY: "CURRENCY",
} as const;

export type CatalogName = (typeof CATALOG_NAMES)[keyof typeof CATALOG_NAMES];

export const DEFAULT_LN = "es";

export interface CatalogSeedRow {
  id: string;
  catalogName: CatalogName;
  catalogId: string;
  catalogDescription: string;
  ln: string;
  sortOrder: number;
}

// prettier-ignore
export const CATALOG_SEED: CatalogSeedRow[] = [
  { id: "39197f86-dc4f-4e09-88b8-67122d7f5778", catalogName: "CATEGORY",   catalogId: "STREAMING",     catalogDescription: "Streaming",             ln: "es", sortOrder: 0 },
  { id: "85138573-dac5-4e21-a2b2-a2c530e2aa90", catalogName: "CATEGORY",   catalogId: "MUSICA",        catalogDescription: "Música",                ln: "es", sortOrder: 1 },
  { id: "d3f08bba-385b-46a2-87a6-b0c581bbf304", catalogName: "CATEGORY",   catalogId: "PRODUCTIVIDAD", catalogDescription: "Productividad",         ln: "es", sortOrder: 2 },
  { id: "24ba9154-b1df-464f-a78d-b28a0275b6e7", catalogName: "CATEGORY",   catalogId: "EDUCACION",     catalogDescription: "Educación",             ln: "es", sortOrder: 3 },
  { id: "5f968707-cf02-40a2-a467-c9b9a63a1526", catalogName: "CATEGORY",   catalogId: "SALUD",         catalogDescription: "Salud",                 ln: "es", sortOrder: 4 },
  { id: "d515fdab-f1c5-4f38-b325-86f88f9f4c6c", catalogName: "CATEGORY",   catalogId: "GAMING",        catalogDescription: "Gaming",                ln: "es", sortOrder: 5 },
  { id: "2ae6c40d-22a0-435a-9508-55715b95c6b9", catalogName: "CATEGORY",   catalogId: "OTROS",         catalogDescription: "Otros",                 ln: "es", sortOrder: 6 },

  { id: "ee16b241-2924-4a52-ae44-c86138daa9f8", catalogName: "IMPORTANCY", catalogId: "BAJA",          catalogDescription: "Baja",                  ln: "es", sortOrder: 0 },
  { id: "6e657d1c-bc35-4efa-8000-a1d8d9e280da", catalogName: "IMPORTANCY", catalogId: "MEDIA",         catalogDescription: "Media",                 ln: "es", sortOrder: 1 },
  { id: "7c99f643-50e4-41e3-9b5a-d4b9852b7b3b", catalogName: "IMPORTANCY", catalogId: "ALTA",          catalogDescription: "Alta",                  ln: "es", sortOrder: 2 },

  { id: "88e7c464-82a3-4757-afa7-16760d7b9b10", catalogName: "CICLFACT",   catalogId: "MONTHLY",       catalogDescription: "Mensual",               ln: "es", sortOrder: 0 },
  { id: "198586ed-2db2-45c6-be99-b6fbbcffbbda", catalogName: "CICLFACT",   catalogId: "BIWEEKLY",      catalogDescription: "Quincenal",             ln: "es", sortOrder: 1 },
  { id: "341e02e6-b8b4-4a9f-83a1-3b312ec85f25", catalogName: "CICLFACT",   catalogId: "ANNUAL",        catalogDescription: "Anual",                 ln: "es", sortOrder: 2 },

  { id: "8acf5ccb-0021-45b6-af38-f71869883ca3", catalogName: "STATUS",     catalogId: "ACTIVE",        catalogDescription: "Activa",                ln: "es", sortOrder: 0 },
  { id: "2c75cf61-9a25-4aa3-b997-480ffbd102e3", catalogName: "STATUS",     catalogId: "PAUSED",        catalogDescription: "Pausada",               ln: "es", sortOrder: 1 },

  { id: "60d5bb8c-cc21-4b4f-89f8-bc98373ae15f", catalogName: "CURRENCY",   catalogId: "COP",           catalogDescription: "COP — Peso colombiano", ln: "es", sortOrder: 0 },
  { id: "7a6b8711-2c2b-412b-a637-5c75d1752c9d", catalogName: "CURRENCY",   catalogId: "USD",           catalogDescription: "USD — Dólar",           ln: "es", sortOrder: 1 },
  { id: "13c7df1a-0cf9-49c4-bdfe-9663f8150ec1", catalogName: "CURRENCY",   catalogId: "EUR",           catalogDescription: "EUR — Euro",            ln: "es", sortOrder: 2 },
];
