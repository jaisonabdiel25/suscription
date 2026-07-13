import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spotlight, GridBackground } from "@/components/ui/spotlight";

const PREVIEW_SUBSCRIPTIONS = [
  { name: "Netflix", category: "Streaming", price: "$14", day: 5 },
  { name: "Spotify", category: "Música", price: "$7", day: 12 },
  { name: "Notion", category: "Productividad", price: "$10", day: 20 },
];

// Spotlight tuned for light backgrounds: a saturated blue that reads on white.
const LIGHT_SPOTLIGHT = {
  gradientFirst:
    "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 50%, .10) 0, hsla(210, 100%, 45%, .04) 50%, hsla(210, 100%, 45%, 0) 80%)",
  gradientSecond:
    "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 50%, .08) 0, hsla(210, 100%, 45%, .03) 80%, transparent 100%)",
  gradientThird:
    "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 50%, .06) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)",
};

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-background text-foreground">
      {/* Grid + spotlight adapt to the active theme */}
      <GridBackground className="dark:hidden" lineColor="rgb(0 0 0 / 0.05)" />
      <GridBackground
        className="hidden dark:block"
        lineColor="rgb(255 255 255 / 0.04)"
      />
      <Spotlight className="dark:hidden" {...LIGHT_SPOTLIGHT} />
      <Spotlight className="hidden dark:block" />

      <div className="relative z-50 mx-auto grid w-full max-w-5xl items-center gap-12 px-4 py-24 md:grid-cols-2 md:py-32">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="secondary">Simple y minimalista</Badge>
          <h1 className="bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-4xl font-semibold tracking-tight text-balance text-transparent md:text-5xl">
            Todas tus suscripciones bajo control
          </h1>
          <p className="max-w-md text-lg text-muted-foreground text-pretty">
            Registra lo que pagas cada mes, organízalo por categorías e
            importancia, y descubre cuánto gastas realmente en suscripciones.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={isAuthenticated ? "/dashboard" : "/signup"}
              className={buttonVariants({ size: "lg" })}
            >
              {isAuthenticated ? "Ir a mi dashboard" : "Crear cuenta"}
              <ArrowRight data-icon="inline-end" />
            </Link>
            {!isAuthenticated && (
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-4 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">Gasto mensual</p>
              <p className="text-2xl font-semibold tabular-nums">$90</p>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {PREVIEW_SUBSCRIPTIONS.map((sub) => (
                <div
                  key={sub.name}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{sub.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.category} · paga el día {sub.day}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">{sub.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Soft fade that blends the hero into the rest of the landing */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-32 bg-linear-to-b from-transparent to-background" />
    </section>
  );
}
