import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const PREVIEW_SUBSCRIPTIONS = [
  { name: "Netflix", category: "Streaming", price: "$26.900", day: 5 },
  { name: "Spotify", category: "Música", price: "$16.900", day: 12 },
  { name: "Notion", category: "Productividad", price: "US$10", day: 20 },
];

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
      <div className="flex flex-col items-start gap-6">
        <Badge variant="secondary">Simple, minimalista y gratis</Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
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
            {isAuthenticated ? "Ir a mi dashboard" : "Comenzar gratis"}
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

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">Gasto mensual</p>
            <p className="text-2xl font-semibold tabular-nums">$83.400</p>
          </div>
          <div className="flex flex-col divide-y">
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
        </CardContent>
      </Card>
    </section>
  );
}
