import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Como requireSession pero además exige que el usuario sea admin. El flag
 * `isAdmin` no viaja en la sesión de better-auth, así que se consulta a la BD.
 * Redirige al dashboard si no lo es.
 */
export async function requireAdmin() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  if (!user?.isAdmin) redirect("/dashboard");
  return session;
}
