"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import { SubscriptionList } from "./subscription-list";
import { SummaryCards } from "./summary-cards";

export function SubscriptionsView({
  initialSubscriptions,
}: {
  initialSubscriptions: SubscriptionDTO[];
}) {
  const { subscriptions, remove, summary } =
    useSubscriptions(initialSubscriptions);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Mis suscripciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus gastos recurrentes en un solo lugar.
          </p>
        </div>
        <Link href="/subscriptions/new" className={buttonVariants()}>
          <Plus data-icon="inline-start" />
          Nueva suscripción
        </Link>
      </div>

      <SummaryCards summary={summary} />

      <SubscriptionList
        subscriptions={subscriptions}
        onDelete={(subscription) => remove(subscription.id)}
      />
    </div>
  );
}
