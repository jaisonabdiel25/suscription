"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { SubscriptionsSummary } from "@/hooks/use-subscriptions";
import { formatPrice } from "@/lib/subscriptions/utils";

export function SummaryCards({
  summary,
  currency,
}: {
  summary: SubscriptionsSummary;
  currency: string;
}) {
  const yearlyLabel = formatPrice(summary.yearlyTotal, currency);
  const monthlyLabel = formatPrice(summary.monthlyTotal, currency);
  const annualLabel = formatPrice(summary.annualTotal, currency);
  const recurringYearlyLabel = formatPrice(summary.monthlyTotal * 12, currency);

  const nextPayment = summary.upcoming[0];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Hero: total anual protagonista */}
      <Card className="border-primary/40 bg-primary/5 sm:col-span-2 lg:row-span-2">
        <CardContent className="flex h-full flex-col justify-between gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              Total anual
            </p>
            <p className="text-4xl font-semibold tracking-tight text-primary tabular-nums lg:text-5xl">
              {yearlyLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              Lo que gastas al año sumando todas las suscripciones activas
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-primary/15 pt-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Recurrentes / año</p>
              <p className="text-lg font-semibold tabular-nums">
                {recurringYearlyLabel}
              </p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Anuales / año</p>
              <p className="text-lg font-semibold tabular-nums">
                {annualLabel}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Gasto mensual</p>
          <p className="text-2xl font-semibold tabular-nums">{monthlyLabel}</p>
          <p className="text-xs text-muted-foreground">
            Mensuales y quincenales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Suscripciones</p>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.activeCount}
          </p>
          <p className="text-xs text-muted-foreground">
            {summary.pausedCount > 0
              ? `activas · ${summary.pausedCount} pausada${summary.pausedCount === 1 ? "" : "s"}`
              : "activas"}
          </p>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-2">
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Próximo pago</p>
          {nextPayment ? (
            <>
              <p className="truncate text-2xl font-semibold">
                {nextPayment.subscription.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {nextPayment.daysLeft === 0
                  ? "hoy"
                  : nextPayment.daysLeft === 1
                    ? "mañana"
                    : `en ${nextPayment.daysLeft} días`}
                {summary.upcoming.length > 1 &&
                  ` · ${summary.upcoming.length - 1} más esta semana`}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold">—</p>
              <p className="text-xs text-muted-foreground">
                Sin pagos en los próximos 7 días
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
