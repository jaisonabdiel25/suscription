import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Currency } from "@/lib/generated/prisma/enums";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import { isAnnual } from "@/lib/subscriptions/utils";
import { SubscriptionItem } from "./subscription-item";

interface SubscriptionListProps {
  subscriptions: SubscriptionDTO[];
  currency: Currency;
  onDelete: (subscription: SubscriptionDTO) => Promise<boolean>;
}

function Section({
  title,
  subtitle,
  subscriptions,
  currency,
  onDelete,
}: {
  title: string;
  subtitle: string;
} & SubscriptionListProps) {
  if (subscriptions.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      {subscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.id}
          subscription={subscription}
          currency={currency}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}

export function SubscriptionList({
  subscriptions,
  currency,
  onDelete,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="font-medium">Aún no tienes suscripciones</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Registra tu primera suscripción para empezar a controlar tus gastos
            recurrentes.
          </p>
          <Link href="/subscriptions/new" className={buttonVariants()}>
            <Plus data-icon="inline-start" />
            Nueva suscripción
          </Link>
        </CardContent>
      </Card>
    );
  }

  const recurring = subscriptions.filter((sub) => !isAnnual(sub));
  const annual = subscriptions.filter(isAnnual);

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="Recurrentes"
        subtitle="Mensuales y quincenales"
        subscriptions={recurring}
        currency={currency}
        onDelete={onDelete}
      />
      <Section
        title="Anuales"
        subtitle="Un pago al año"
        subscriptions={annual}
        currency={currency}
        onDelete={onDelete}
      />
    </div>
  );
}
