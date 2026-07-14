import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { toCatalogRow } from "@/lib/catalog/serializers";
import { CatalogAdmin } from "@/components/catalog/catalog-admin";

export const metadata: Metadata = {
  title: "Catálogos",
};

export default async function CatalogAdminPage() {
  await requireAdmin();

  const rows = await prisma.catalog.findMany({
    orderBy: [{ catalogName: "asc" }, { ln: "asc" }, { sortOrder: "asc" }],
  });

  return <CatalogAdmin rows={rows.map(toCatalogRow)} />;
}
