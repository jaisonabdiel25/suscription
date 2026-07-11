"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/profile";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const UNAUTHORIZED = "Debes iniciar sesión.";
const UNEXPECTED = "Ocurrió un error inesperado. Inténtalo de nuevo.";

export type ProfileDTO = {
  name: string;
  email: string;
  currency: "COP" | "USD" | "EUR";
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
