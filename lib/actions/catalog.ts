"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { toCatalogRow, type CatalogRow } from "@/lib/catalog/serializers";
import { catalogSchema } from "@/lib/validations/catalog";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const FORBIDDEN = "No tienes permiso para gestionar catálogos.";
const NOT_FOUND = "El registro de catálogo no existe.";
const DUPLICATE = "Ya existe una opción con ese catálogo, código e idioma.";
const UNEXPECTED = "Ocurrió un error inesperado. Inténtalo de nuevo.";

/** Devuelve el id del usuario si es admin; null en cualquier otro caso. */
async function adminUserId(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  return user?.isAdmin ? session.user.id : null;
}

function isUniqueViolation(error: unknown): boolean {
  return hasCode(error, "P2002");
}

function isRecordNotFound(error: unknown): boolean {
  return hasCode(error, "P2025");
}

function hasCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === code
  );
}

export async function createCatalog(
  input: unknown
): Promise<ActionResult<CatalogRow>> {
  if (!(await adminUserId())) return { ok: false, error: FORBIDDEN };

  const parsed = catalogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const row = await prisma.catalog.create({ data: parsed.data });
    revalidatePath("/", "layout");
    return { ok: true, data: toCatalogRow(row) };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: DUPLICATE };
    return { ok: false, error: UNEXPECTED };
  }
}

export async function updateCatalog(
  id: string,
  input: unknown
): Promise<ActionResult<CatalogRow>> {
  if (!(await adminUserId())) return { ok: false, error: FORBIDDEN };

  const parsed = catalogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const row = await prisma.catalog.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/", "layout");
    return { ok: true, data: toCatalogRow(row) };
  } catch (error) {
    if (isRecordNotFound(error)) return { ok: false, error: NOT_FOUND };
    if (isUniqueViolation(error)) return { ok: false, error: DUPLICATE };
    return { ok: false, error: UNEXPECTED };
  }
}

export async function deleteCatalog(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!(await adminUserId())) return { ok: false, error: FORBIDDEN };

  try {
    await prisma.catalog.delete({ where: { id } });
    revalidatePath("/", "layout");
    return { ok: true, data: { id } };
  } catch (error) {
    if (isRecordNotFound(error)) return { ok: false, error: NOT_FOUND };
    return { ok: false, error: UNEXPECTED };
  }
}
