"use client";

import { type CSSProperties, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { CATALOG_NAMES } from "@/lib/catalog/seed-data";
import { catalogOptions, type CatalogData } from "@/lib/catalog/serializers";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import { formatPrice, monthlyEquivalent } from "@/lib/subscriptions/utils";

// Cada entidad conserva su color por su posición (sortOrder) dentro de su
// catálogo, tomado de la paleta --chart-N validada en globals.css (7 tonos).
const CHART_PALETTE_SIZE = 7;
const colorAt = (index: number) =>
  `var(--chart-${(index % CHART_PALETTE_SIZE) + 1})`;

const compactNumber = new Intl.NumberFormat("es-CO", { notation: "compact" });

interface Datum {
  key: string;
  name: string;
  value: number;
  fill: string;
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function StatisticsView({
  subscriptions,
  currency,
  catalog,
}: {
  subscriptions: SubscriptionDTO[];
  currency: string;
  catalog: CatalogData;
}) {
  const { summary } = useSubscriptions(subscriptions);
  const categoryOptions = catalogOptions(catalog, CATALOG_NAMES.CATEGORY);
  const cycleOptions = catalogOptions(catalog, CATALOG_NAMES.CICLFACT);

  // Short currency for on-chart labels, e.g. "$27 K" — keeps them inside marks.
  const compactPrice = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  // A background-colored halo behind label text so numbers stay legible on top
  // of any slice color, in both light and dark themes.
  const labelHaloStyle = { paintOrder: "stroke" } as CSSProperties;

  const { spendByCategory, countByCycle } = useMemo(() => {
    const active = subscriptions.filter((sub) => sub.status === "ACTIVE");

    const spendByCategory: Datum[] = categoryOptions
      .map((option, index) => {
        const value = active
          .filter((sub) => sub.category === option.code)
          .reduce((sum, sub) => sum + monthlyEquivalent(sub), 0);
        return {
          key: option.code,
          name: option.label,
          value,
          fill: colorAt(index),
        };
      })
      .filter((datum) => datum.value > 0);

    const countByCycle: Datum[] = cycleOptions
      .map((option, index) => ({
        key: option.code,
        name: option.label,
        value: active.filter((sub) => sub.billingCycle === option.code).length,
        fill: colorAt(index),
      }))
      .filter((datum) => datum.value > 0);

    return { spendByCategory, countByCycle };
  }, [subscriptions, categoryOptions, cycleOptions]);

  const categoryConfig = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        categoryOptions.map((option, index) => [
          option.code,
          { label: option.label, color: colorAt(index) },
        ])
      ),
    [categoryOptions]
  );

  const cycleConfig = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        cycleOptions.map((option, index) => [
          option.code,
          { label: option.label, color: colorAt(index) },
        ])
      ),
    [cycleOptions]
  );

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="font-medium">Aún no hay datos que mostrar</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Registra tus suscripciones para ver estadísticas de tus gastos
              recurrentes.
            </p>
            <Link href="/subscriptions/new" className={buttonVariants()}>
              <Plus data-icon="inline-start" />
              Nueva suscripción
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Header />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Gasto mensual"
          value={formatPrice(summary.monthlyTotal, currency)}
          hint="Mensuales y quincenales"
        />
        <KpiCard
          label="Gasto anual"
          value={formatPrice(summary.annualTotal, currency)}
          hint="Suscripciones anuales (por año)"
        />
        <KpiCard
          label="Activas"
          value={String(summary.activeCount)}
          hint="Suscripciones en curso"
        />
        <KpiCard
          label="Pausadas"
          value={String(summary.pausedCount)}
          hint="Sin cobros por ahora"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gasto mensual por categoría</CardTitle>
            <CardDescription>
              Suma de suscripciones activas mensuales y quincenales. Las anuales
              no se incluyen aquí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {spendByCategory.length > 0 ? (
              <ChartContainer
                config={categoryConfig}
                className="aspect-auto h-75 w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={spendByCategory}
                  layout="vertical"
                  margin={{ left: 12, right: 64 }}
                >
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => compactNumber.format(value)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={96}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, _name, item) =>
                          `${item.payload.name}: ${formatPrice(Number(value), currency)}`
                        }
                      />
                    }
                  />
                  <Bar dataKey="value" radius={4}>
                    {spendByCategory.map((datum) => (
                      <Cell key={datum.key} fill={datum.fill} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      className="fill-foreground"
                      fontSize={12}
                      formatter={(value) => compactPrice(Number(value))}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChart message="Sin gasto mensual registrado. ¿Solo tienes suscripciones anuales?" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución del gasto</CardTitle>
            <CardDescription>Participación de cada categoría en el gasto mensual.</CardDescription>
          </CardHeader>
          <CardContent>
            {spendByCategory.length > 0 ? (
              <ChartContainer
                config={categoryConfig}
                className="aspect-auto h-75 w-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="key"
                        hideLabel
                        formatter={(value, _name, item) =>
                          `${item.payload.name}: ${formatPrice(Number(value), currency)}`
                        }
                      />
                    }
                  />
                  <Pie
                    data={spendByCategory}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={60}
                    strokeWidth={2}
                  >
                    {spendByCategory.map((datum) => (
                      <Cell key={datum.key} fill={datum.fill} />
                    ))}
                    <LabelList
                      dataKey="value"
                      className="fill-foreground"
                      stroke="var(--background)"
                      strokeWidth={3}
                      style={labelHaloStyle}
                      fontSize={11}
                      formatter={(value) => compactPrice(Number(value))}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="key" />}
                    className="flex-wrap gap-2"
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyChart message="Sin gasto mensual registrado." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suscripciones por ciclo</CardTitle>
            <CardDescription>Cuántas suscripciones activas hay de cada ciclo.</CardDescription>
          </CardHeader>
          <CardContent>
            {countByCycle.length > 0 ? (
              <ChartContainer
                config={cycleConfig}
                className="aspect-auto h-75 w-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="key"
                        hideLabel
                        formatter={(value, _name, item) =>
                          `${item.payload.name}: ${value} suscripción${Number(value) === 1 ? "" : "es"}`
                        }
                      />
                    }
                  />
                  <Pie
                    data={countByCycle}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={60}
                    strokeWidth={2}
                  >
                    {countByCycle.map((datum) => (
                      <Cell key={datum.key} fill={datum.fill} />
                    ))}
                    <LabelList
                      dataKey="value"
                      className="fill-foreground"
                      stroke="var(--background)"
                      strokeWidth={3}
                      style={labelHaloStyle}
                      fontSize={12}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="key" />}
                    className="flex-wrap gap-2"
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyChart message="No hay suscripciones activas." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>
      <p className="text-sm text-muted-foreground">
        Un vistazo a la composición de tus suscripciones.
      </p>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-75 items-center justify-center px-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
