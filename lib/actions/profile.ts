"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/catalog/catalog";
import { CATALOG_NAMES } from "@/lib/catalog/seed-data";
import { isValidCode } from "@/lib/catalog/serializers";
import { profileSchema } from "@/lib/validations/profile";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const UNAUTHORIZED = "Debes iniciar sesión.";
const UNEXPECTED = "Ocurrió un error inesperado. Inténtalo de nuevo.";
const INVALID_CURRENCY = "La moneda seleccionada no es válida.";

export type ProfileDTO = {
  name: string;
  email: string;
  currency: string;
};

export async function updateProfile(
  input: unknown
): Promise<ActionResult<ProfileDTO>> {
  const session = await getSession();
  if (!session) return { ok: false, error: UNAUTHORIZED };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const catalog = await getCatalog();
  if (!isValidCode(catalog, CATALOG_NAMES.CURRENCY, parsed.data.currency)) {
    return { ok: false, error: INVALID_CURRENCY };
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { name: true, email: true, currency: true },
    });
    // Currency drives money formatting across the app.
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    return { ok: true, data: user };
  } catch {
    return { ok: false, error: UNEXPECTED };
  }
}
