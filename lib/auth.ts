import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

// Orígenes desde los que se aceptan peticiones de auth. better-auth ya confía
// en BETTER_AUTH_URL; aquí agregamos los extra por ambiente. Sin esto rechaza
// con 403 INVALID_ORIGIN cuando el navegador usa un origen distinto (p. ej.
// 127.0.0.1 en local, o un dominio adicional en DEV/PRE).
const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  ...(process.env.TRUSTED_ORIGINS?.split(",") ?? []),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

if (process.env.NODE_ENV === "development") {
  trustedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  trustedOrigins,
  plugins: [nextCookies()],
});
