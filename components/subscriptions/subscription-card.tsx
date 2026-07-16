"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CatalogData } from "@/lib/catalog/serializers";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import { formatPrice, paymentDateLabel } from "@/lib/subscriptions/utils";
import { SubscriptionForm } from "./subscription-form";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

interface SubscriptionCardProps {
  subscription: SubscriptionDTO;
  currency: string;
  catalog: CatalogData;
}

export function SubscriptionCard({
  subscription,
  currency,
  catalog,
}: SubscriptionCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <SubscriptionForm
        subscription={subscription}
        catalog={catalog}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  const isPaused = subscription.status === "PAUSED";

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle
            role="heading"
            aria-level={1}
            className="flex items-center gap-2"
          >
            {subscription.name}
            {isPaused && <Badge variant="outline">Pausada</Badge>}
          </CardTitle>
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Pencil data-icon="inline-start" />
            Editar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoría">{subscription.categoryLabel}</Field>
        <Field label="Importancia">{subscription.importanceLabel}</Field>
        <Field label="Precio">
          <span className="font-semibold tabular-nums">
            {formatPrice(subscription.price, currency)}
          </span>
        </Field>
        <Field label="Ciclo de facturación">
          {subscription.billingCycleLabel}
        </Field>
        <Field label="Fecha de pago">{paymentDateLabel(subscription)}</Field>
        <Field label="Estado">{subscription.statusLabel}</Field>
        {subscription.url && (
          <Field label="URL del servicio">
            <a
              href={subscription.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <span className="max-w-full truncate">{subscription.url}</span>
              <ExternalLink className="size-3.5 shrink-0" />
            </a>
          </Field>
        )}
        {subscription.notes && (
          <div className="sm:col-span-2">
            <Field label="Notas">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {subscription.notes}
              </p>
            </Field>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-6 flex justify-end">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline" })}
        >
          Volver
        </Link>
      </CardFooter>
    </Card>
  );
}
