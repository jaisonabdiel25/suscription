"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubscriptionForm } from "@/hooks/use-subscription-form";
import {
  createSubscription,
  updateSubscription,
} from "@/lib/actions/subscriptions";
import type {
  BillingCycle,
  Category,
  Currency,
  Importance,
  SubscriptionStatus,
} from "@/lib/generated/prisma/enums";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import {
  BILLING_CYCLE_LABELS,
  CATEGORY_LABELS,
  CURRENCY_LABELS,
  IMPORTANCE_LABELS,
  STATUS_LABELS,
} from "@/lib/subscriptions/utils";
import {
  BILLING_CYCLES,
  CATEGORIES,
  CURRENCIES,
  IMPORTANCES,
  SUBSCRIPTION_STATUSES,
  type SubscriptionInput,
} from "@/lib/validations/subscription";

const categoryItems = CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));
const importanceItems = IMPORTANCES.map((value) => ({
  value,
  label: IMPORTANCE_LABELS[value],
}));
const currencyItems = CURRENCIES.map((value) => ({
  value,
  label: CURRENCY_LABELS[value],
}));
const billingCycleItems = BILLING_CYCLES.map((value) => ({
  value,
  label: BILLING_CYCLE_LABELS[value],
}));
const statusItems = SUBSCRIPTION_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

interface SubscriptionFormProps {
  /** Subscription being edited, or null to create a new one. */
  subscription: SubscriptionDTO | null;
}

export function SubscriptionForm({ subscription }: SubscriptionFormProps) {
  const router = useRouter();
  const isEditing = subscription !== null;

  const onSubmit = async (input: SubscriptionInput): Promise<boolean> => {
    const result = isEditing
      ? await updateSubscription(subscription.id, input)
      : await createSubscription(input);

    if (!result.ok) {
      toast.error(result.error);
      return false;
    }

    toast.success(isEditing ? "Suscripción actualizada" : "Suscripción creada");
    router.push("/dashboard");
    router.refresh();
    return true;
  };

  const { values, errors, isSubmitting, setValue, handleSubmit } =
    useSubscriptionForm({ initial: subscription, onSubmit });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar suscripción" : "Nueva suscripción"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza los datos de esta suscripción."
            : "Registra un servicio que pagas de forma recurrente."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Netflix, Spotify..."
              value={values.name}
              onChange={(e) => setValue("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            <FieldError message={errors.name} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Categoría</Label>
              <Select
                items={categoryItems}
                value={values.category || null}
                onValueChange={(value) =>
                  setValue("category", (value ?? "") as Category | "")
                }
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={Boolean(errors.category)}
                >
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {categoryItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.category} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Importancia</Label>
              <Select
                items={importanceItems}
                value={values.importance}
                onValueChange={(value) =>
                  setValue("importance", value as Importance)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {importanceItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.importance} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="26900"
                value={values.price}
                onChange={(e) => setValue("price", e.target.value)}
                aria-invalid={Boolean(errors.price)}
              />
              <FieldError message={errors.price} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Moneda</Label>
              <Select
                items={currencyItems}
                value={values.currency}
                onValueChange={(value) => setValue("currency", value as Currency)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.currency} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="paymentDay">Día de pago (1-31)</Label>
              <Input
                id="paymentDay"
                type="number"
                min="1"
                max="31"
                placeholder="5"
                value={values.paymentDay}
                onChange={(e) => setValue("paymentDay", e.target.value)}
                aria-invalid={Boolean(errors.paymentDay)}
              />
              <FieldError message={errors.paymentDay} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Ciclo de facturación</Label>
              <Select
                items={billingCycleItems}
                value={values.billingCycle}
                onValueChange={(value) =>
                  setValue("billingCycle", value as BillingCycle)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billingCycleItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.billingCycle} />
            </div>
          </div>

          {isEditing && (
            <div className="flex flex-col gap-2">
              <Label>Estado</Label>
              <Select
                items={statusItems}
                value={values.status}
                onValueChange={(value) =>
                  setValue("status", value as SubscriptionStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.status} />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="url">URL del servicio (opcional)</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://netflix.com"
              value={values.url}
              onChange={(e) => setValue("url", e.target.value)}
              aria-invalid={Boolean(errors.url)}
            />
            <FieldError message={errors.url} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Plan familiar, se comparte con..."
              rows={2}
              value={values.notes}
              onChange={(e) => setValue("notes", e.target.value)}
              aria-invalid={Boolean(errors.notes)}
            />
            <FieldError message={errors.notes} />
          </div>
        </CardContent>

        <CardFooter className="mt-6 flex justify-end gap-2">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline" })}
            aria-disabled={isSubmitting}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear suscripción"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
