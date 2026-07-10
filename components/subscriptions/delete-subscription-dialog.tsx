"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ConfirmController } from "@/hooks/use-confirm";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";

export function DeleteSubscriptionDialog({
  controller,
}: {
  controller: ConfirmController<SubscriptionDTO>;
}) {
  return (
    <AlertDialog
      open={controller.isOpen}
      onOpenChange={(open) => {
        if (!open) controller.cancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar suscripción?</AlertDialogTitle>
          <AlertDialogDescription>
            {controller.item
              ? `Se eliminará "${controller.item.name}" de forma permanente. Esta acción no se puede deshacer.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={controller.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={controller.confirm}
            disabled={controller.isPending}
          >
            {controller.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
