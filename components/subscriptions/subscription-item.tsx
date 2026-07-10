"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import {
  BILLING_CYCLE_LABELS,
  CATEGORY_LABELS,
  IMPORTANCE_LABELS,
  formatPrice,
} from "@/lib/subscriptions/utils";
import { cn } from "@/lib/utils";

interface SubscriptionItemProps {
  subscription: SubscriptionDTO;
  onDelete: (subscription: SubscriptionDTO) => Promise<boolean>;
}

export function SubscriptionItem({
  subscription,
  onDelete,
}: SubscriptionItemProps) {
  const isPaused = subscription.status === "PAUSED";
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const ok = await onDelete(subscription);
      // If it failed, keep the card so the user can retry; reset the prompt.
      if (!ok) setIsConfirmingDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className={cn(isPaused && "opacity-60")}>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{subscription.name}</p>
            {subscription.url && (
              <a
                href={subscription.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Abrir sitio de ${subscription.name}`}
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
            {isPaused && <Badge variant="outline">Pausada</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {CATEGORY_LABELS[subscription.category]}
            </Badge>
            <Badge
              variant={subscription.importance === "ALTA" ? "default" : "outline"}
            >
              Importancia {IMPORTANCE_LABELS[subscription.importance].toLowerCase()}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              Se paga el día {subscription.paymentDay}
            </span>
          </div>
          {subscription.notes && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {subscription.notes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="text-right">
            <p className="font-semibold tabular-nums">
              {formatPrice(subscription.price, subscription.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {BILLING_CYCLE_LABELS[subscription.billingCycle].toLowerCase()}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Opciones de ${subscription.name}`}
                />
              }
            >
              <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href={`/subscriptions/${subscription.id}`} />}
              >
                <Pencil />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsConfirmingDelete(true)}
              >
                <Trash2 />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      {isConfirmingDelete && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-(--card-spacing) pt-(--card-spacing)">
          <p className="text-sm">
            ¿Eliminar <span className="font-medium">«{subscription.name}»</span>?
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
