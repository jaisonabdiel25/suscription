/** Una opción de catálogo lista para un <Select> o para resolver un label. */
export interface CatalogOption {
  /** Código estable (catalogId), lo que se guarda en la suscripción. */
  code: string;
  /** Texto mostrado (catalogDescription en el idioma pedido). */
  label: string;
  sortOrder: number;
}

/**
 * Snapshot del catálogo para un idioma, plano y serializable para cruzar la
 * frontera Server → Client. `groups` agrupa por catalogName; `labels` resuelve
 * `${catalogName}:${code}` → label.
 */
export interface CatalogData {
  groups: Record<string, CatalogOption[]>;
  labels: Record<string, string>;
}

/** Opciones de un catálogo (vacío si no existe). */
export function catalogOptions(
  catalog: CatalogData,
  catalogName: string
): CatalogOption[] {
  return catalog.groups[catalogName] ?? [];
}

/** Label de un código; cae al propio código si no hay traducción. */
export function catalogLabel(
  catalog: CatalogData,
  catalogName: string,
  code: string
): string {
  return catalog.labels[`${catalogName}:${code}`] ?? code;
}

/** ¿El código existe (y está activo) dentro de su catálogo? */
export function isValidCode(
  catalog: CatalogData,
  catalogName: string,
  code: string
): boolean {
  return catalog.labels[`${catalogName}:${code}`] !== undefined;
}

/** Fila completa de catálogo para la gestión de admin (sin timestamps). */
export interface CatalogRow {
  id: string;
  catalogName: string;
  catalogId: string;
  catalogDescription: string;
  ln: string;
  sortOrder: number;
  isActive: boolean;
}

export function toCatalogRow(row: {
  id: string;
  catalogName: string;
  catalogId: string;
  catalogDescription: string;
  ln: string;
  sortOrder: number;
  isActive: boolean;
}): CatalogRow {
  return {
    id: row.id,
    catalogName: row.catalogName,
    catalogId: row.catalogId,
    catalogDescription: row.catalogDescription,
    ln: row.ln,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}
