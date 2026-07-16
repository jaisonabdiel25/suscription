import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATALOG_SEED } from "../lib/catalog/seed-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  for (const row of CATALOG_SEED) {
    await prisma.catalog.upsert({
      where: {
        catalogName_catalogId_ln: {
          catalogName: row.catalogName,
          catalogId: row.catalogId,
          ln: row.ln,
        },
      },
      create: row,
      update: {
        // Reescribe el id si la fila fue sembrada antes con uno aleatorio.
        // Nada referencia catalog.id por FK, así que cambiar el PK es seguro.
        id: row.id,
        catalogDescription: row.catalogDescription,
        sortOrder: row.sortOrder,
      },
    });
  }
  console.log(`Seed de catálogo listo: ${CATALOG_SEED.length} filas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
