"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import type { SubscriptionInput } from "@/lib/validations/subscription";
import { DeleteSubscriptionDialog } from "./delete-subscription-dialog";
import { SubscriptionFormDialog } from "./subscription-form-dialog";
import { SubscriptionList } from "./subscription-list";
import { SummaryCards } from "./summary-cards";

export function SubscriptionsView({
  initialSubscriptions,
}: {
  initialSubscriptions: SubscriptionDTO[];
}) {
  const { subscriptions, create, update, remove, summary } =
    useSubscriptions(initialSubscriptions);

  const formDialog = useDisclosure();
  const [editing, setEditing] = useState<SubscriptionDTO | null>(null);
  const deleteConfirm = useConfirm<SubscriptionDTO>((subscription) =>
    remove(subscription.id)
  );

  const openCreate = () => {
    setEditing(null);
    formDialog.onOpen();
  };

  const openEdit = (subscription: SubscriptionDTO) => {
    setEditing(subscription);
    formDialog.onOpen();
  };

  const handleSubmit = async (input: SubscriptionInput) => {
    const ok = editing ? await update(editing.id, input) : await create(input);
    if (ok) formDialog.onClose();
    return ok;
  };

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
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Nueva suscripción
        </Button>
      </div>

      <SummaryCards summary={summary} />

      <SubscriptionList
        subscriptions={subscriptions}
        onEdit={openEdit}
        onDelete={deleteConfirm.ask}
        onAdd={openCreate}
      />

      <SubscriptionFormDialog
        key={editing?.id ?? "new"}
        open={formDialog.open}
        onOpenChange={formDialog.setOpen}
        subscription={editing}
        onSubmit={handleSubmit}
      />

      <DeleteSubscriptionDialog controller={deleteConfirm} />
    </div>
  );
}
