"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/catalog/catalog";
import { CATALOG_NAMES } from "@/lib/catalog/seed-data";
import { isValidCode, type CatalogData } from "@/lib/catalog/serializers";
import { subscriptionSchema } from "@/lib/validations/subscription";
import {
  toSubscriptionDTO,
  type SubscriptionDTO,
} from "@/lib/subscriptions/serializers";
import type { SubscriptionInput } from "@/lib/validations/subscription";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const UNAUTHORIZED = "Debes iniciar sesión.";
const NOT_FOUND = "La suscripción no existe.";
const UNEXPECTED = "Ocurrió un error inesperado. Inténtalo de nuevo.";
const INVALID_OPTION = "Alguna opción seleccionada ya no es válida.";

/** Verifica que los códigos de catálogo enviados existan (y estén activos). */
function catalogCodesValid(
  catalog: CatalogData,
  data: SubscriptionInput
): boolean {
  return (
    isValidCode(catalog, CATALOG_NAMES.CATEGORY, data.category) &&
    isValidCode(catalog, CATALOG_NAMES.IMPORTANCY, data.importance) &&
    isValidCode(catalog, CATALOG_NAMES.CICLFACT, data.billingCycle) &&
    isValidCode(catalog, CATALOG_NAMES.STATUS, data.status)
  );
}

export async function createSubscription(
  input: unknown
): Promise<ActionResult<SubscriptionDTO>> {
  const session = await getSession();
  if (!session) return { ok: false, error: UNAUTHORIZED };

  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const catalog = await getCatalog();
  if (!catalogCodesValid(catalog, parsed.data)) {
    return { ok: false, error: INVALID_OPTION };
  }

  try {
    const subscription = await prisma.subscription.create({
      data: { ...parsed.data, userId: session.user.id },
    });
    revalidatePath("/dashboard");
    return { ok: true, data: toSubscriptionDTO(subscription, catalog) };
  } catch {
    return { ok: false, error: UNEXPECTED };
  }
}

export async function updateSubscription(
  id: string,
  input: unknown
): Promise<ActionResult<SubscriptionDTO>> {
  const session = await getSession();
  if (!session) return { ok: false, error: UNAUTHORIZED };

  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const catalog = await getCatalog();
  if (!catalogCodesValid(catalog, parsed.data)) {
    return { ok: false, error: INVALID_OPTION };
  }

  try {
    // userId in the where clause enforces ownership: another user's id throws P2025
    const subscription = await prisma.subscription.update({
      where: { id, userId: session.user.id },
      data: parsed.data,
    });
    revalidatePath("/dashboard");
    return { ok: true, data: toSubscriptionDTO(subscription, catalog) };
  } catch (error) {
    if (isRecordNotFound(error)) return { ok: false, error: NOT_FOUND };
    return { ok: false, error: UNEXPECTED };
  }
}

export async function deleteSubscription(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: UNAUTHORIZED };

  try {
    await prisma.subscription.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/dashboard");
    return { ok: true, data: { id } };
  } catch (error) {
    if (isRecordNotFound(error)) return { ok: false, error: NOT_FOUND };
    return { ok: false, error: UNEXPECTED };
  }
}

function isRecordNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2025"
  );
}
