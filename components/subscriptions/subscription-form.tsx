"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { CATALOG_NAMES } from "@/lib/catalog/seed-data";
import { catalogOptions, type CatalogData } from "@/lib/catalog/serializers";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import { MONTH_NAMES } from "@/lib/subscriptions/utils";
import type { SubscriptionInput } from "@/lib/validations/subscription";

/** Opciones de catálogo → items del <Select>. */
function toItems(options: { code: string; label: string }[]) {
  return options.map((option) => ({ value: option.code, label: option.label }));
}

const monthItems = MONTH_NAMES.map((label, index) => ({
  value: String(index + 1),
  label: label.charAt(0).toUpperCase() + label.slice(1),
}));

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      {" "}
      *
    </span>
  );
}

interface SubscriptionFormProps {
  /** Subscription being edited, or null to create a new one. */
  subscription: SubscriptionDTO | null;
  /** Opciones de los selects, cargadas desde la tabla de catálogos. */
  catalog: CatalogData;
  /** Called on Cancel. Defaults to navigating back to the dashboard. */
  onCancel?: () => void;
  /** Called after a successful save. Defaults to navigating to the dashboard. */
  onSuccess?: () => void;
}

export function SubscriptionForm({
  subscription,
  catalog,
  onCancel,
  onSuccess,
}: SubscriptionFormProps) {
  const router = useRouter();
  const isEditing = subscription !== null;

  const categoryItems = toItems(catalogOptions(catalog, CATALOG_NAMES.CATEGORY));
  const importanceItems = toItems(
    catalogOptions(catalog, CATALOG_NAMES.IMPORTANCY)
  );
  const billingCycleItems = toItems(
    catalogOptions(catalog, CATALOG_NAMES.CICLFACT)
  );
  const statusItems = toItems(catalogOptions(catalog, CATALOG_NAMES.STATUS));

  const handleCancel = onCancel ?? (() => router.push("/dashboard"));

  const onSubmit = async (input: SubscriptionInput): Promise<boolean> => {
    const result = isEditing
      ? await updateSubscription(subscription.id, input)
      : await createSubscription(input);

    if (!result.ok) {
      toast.error(result.error);
      return false;
    }

    toast.success(isEditing ? "Suscripción actualizada" : "Suscripción creada");
    if (onSuccess) {
      router.refresh();
      onSuccess();
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    return true;
  };

  const {
    values,
    errors,
    isSubmitting,
    isValid,
    setValue,
    validateField,
    handleSubmit,
  } = useSubscriptionForm({ initial: subscription, onSubmit });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
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
            <Label htmlFor="name">
              Nombre
              <RequiredMark />
            </Label>
            <Input
              id="name"
              placeholder="Netflix, Spotify..."
              value={values.name}
              onChange={(e) => setValue("name", e.target.value)}
              onBlur={() => validateField("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>
                Categoría
                <RequiredMark />
              </Label>
              <Select
                items={categoryItems}
                value={values.category || null}
                onValueChange={(value) => setValue("category", value ?? "")}
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
              <Label>
                Importancia
                <RequiredMark />
              </Label>
              <Select
                items={importanceItems}
                value={values.importance}
                onValueChange={(value) => setValue("importance", value ?? "")}
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
              <Label htmlFor="price">
                Precio
                <RequiredMark />
              </Label>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="26900"
                value={values.price}
                onChange={(e) => setValue("price", e.target.value)}
                onBlur={() => validateField("price")}
                aria-invalid={Boolean(errors.price)}
                aria-describedby={errors.price ? "price-error" : undefined}
              />
              <FieldError id="price-error" message={errors.price} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>
                Ciclo de facturación
                <RequiredMark />
              </Label>
              <Select
                items={billingCycleItems}
                value={values.billingCycle}
                onValueChange={(value) => setValue("billingCycle", value ?? "")}
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="paymentDay">
                {values.billingCycle === "BIWEEKLY"
                  ? "Primer día de pago (1-31)"
                  : "Día de pago (1-31)"}
                <RequiredMark />
              </Label>
              <Input
                id="paymentDay"
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                placeholder="5"
                value={values.paymentDay}
                onChange={(e) => setValue("paymentDay", e.target.value)}
                onBlur={() => validateField("paymentDay")}
                aria-invalid={Boolean(errors.paymentDay)}
                aria-describedby={
                  errors.paymentDay ? "paymentDay-error" : undefined
                }
              />
              <FieldError id="paymentDay-error" message={errors.paymentDay} />
            </div>

            {values.billingCycle === "BIWEEKLY" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="secondPaymentDay">
                  Segundo día de pago (1-31)
                  <RequiredMark />
                </Label>
                <Input
                  id="secondPaymentDay"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="31"
                  placeholder="20"
                  value={values.secondPaymentDay}
                  onChange={(e) =>
                    setValue("secondPaymentDay", e.target.value)
                  }
                  onBlur={() => validateField("secondPaymentDay")}
                  aria-invalid={Boolean(errors.secondPaymentDay)}
                  aria-describedby={
                    errors.secondPaymentDay
                      ? "secondPaymentDay-error"
                      : undefined
                  }
                />
                <FieldError
                  id="secondPaymentDay-error"
                  message={errors.secondPaymentDay}
                />
              </div>
            )}

            {values.billingCycle === "ANNUAL" && (
              <div className="flex flex-col gap-2">
                <Label>
                  Mes de pago
                  <RequiredMark />
                </Label>
                <Select
                  items={monthItems}
                  value={values.paymentMonth || null}
                  onValueChange={(value) =>
                    setValue("paymentMonth", value ?? "")
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={Boolean(errors.paymentMonth)}
                  >
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.paymentMonth} />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex flex-col gap-2">
              <Label>Estado</Label>
              <Select
                items={statusItems}
                value={values.status}
                onValueChange={(value) => setValue("status", value ?? "")}
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
              inputMode="url"
              placeholder="https://netflix.com"
              value={values.url}
              onChange={(e) => setValue("url", e.target.value)}
              onBlur={() => validateField("url")}
              aria-invalid={Boolean(errors.url)}
              aria-describedby={errors.url ? "url-error" : undefined}
            />
            <FieldError id="url-error" message={errors.url} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Plan familiar, se comparte con..."
              rows={2}
              value={values.notes}
              onChange={(e) => setValue("notes", e.target.value)}
              onBlur={() => validateField("notes")}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? "notes-error" : undefined}
            />
            <FieldError id="notes-error" message={errors.notes} />
          </div>
        </CardContent>

        <CardFooter className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !isValid}>
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
