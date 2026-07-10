"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { SubscriptionsSummary } from "@/hooks/use-subscriptions";
import { formatPrice } from "@/lib/subscriptions/utils";

export function SummaryCards({ summary }: { summary: SubscriptionsSummary }) {
  const monthlyLabel =
    summary.monthlyTotals.length > 0
      ? summary.monthlyTotals
          .map(({ currency, total }) => formatPrice(total, currency))
          .join(" + ")
      : formatPrice(0, "COP");

  const nextPayment = summary.upcoming[0];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Gasto mensual</p>
          <p className="text-2xl font-semibold tabular-nums">{monthlyLabel}</p>
          <p className="text-xs text-muted-foreground">
            Pagos anuales prorrateados por mes
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
      <Card>
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
