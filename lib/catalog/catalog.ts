import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DEFAULT_LN } from "./seed-data";
import type { CatalogData, CatalogOption } from "./serializers";

async function loadCatalog(ln: string): Promise<CatalogData> {
  const rows = await prisma.catalog.findMany({
    where: { ln, isActive: true },
    orderBy: [{ catalogName: "asc" }, { sortOrder: "asc" }],
  });

  const groups: Record<string, CatalogOption[]> = {};
  const labels: Record<string, string> = {};

  for (const row of rows) {
    (groups[row.catalogName] ??= []).push({
      code: row.catalogId,
      label: row.catalogDescription,
      sortOrder: row.sortOrder,
    });
    labels[`${row.catalogName}:${row.catalogId}`] = row.catalogDescription;
  }

  return { groups, labels };
}

/**
 * Catálogo para un idioma. Deduplicado por request con React `cache()`: varias
 * llamadas en el mismo render golpean la BD una sola vez. La tabla es pequeña
 * (read-mostly) y las páginas ya son dinámicas, así que tras una edición del
 * admin el siguiente request lee datos frescos sin invalidación explícita.
 */
export const getCatalog = cache(
  (ln: string = DEFAULT_LN): Promise<CatalogData> => loadCatalog(ln)
);
