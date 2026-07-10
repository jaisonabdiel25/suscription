import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import { SubscriptionItem } from "./subscription-item";

interface SubscriptionListProps {
  subscriptions: SubscriptionDTO[];
  onDelete: (subscription: SubscriptionDTO) => Promise<boolean>;
}

export function SubscriptionList({
  subscriptions,
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

  return (
    <div className="flex flex-col gap-3">
      {subscriptions.map((subscription) => (
        <SubscriptionItem
          key={subscription.id}
          subscription={subscription}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
