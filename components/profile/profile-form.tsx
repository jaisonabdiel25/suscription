"use client";

import { useState } from "react";
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
import { updateProfile } from "@/lib/actions/profile";
import type { Currency } from "@/lib/generated/prisma/enums";
import { CURRENCY_LABELS } from "@/lib/subscriptions/utils";
import { CURRENCIES, profileSchema } from "@/lib/validations/profile";

const currencyItems = CURRENCIES.map((value) => ({
  value,
  label: CURRENCY_LABELS[value],
}));

interface ProfileFormProps {
  profile: { name: string; email: string; currency: Currency };
  /** Called on Cancel. */
  onCancel?: () => void;
  /** Called after a successful save. */
  onSuccess?: () => void;
}

type FieldErrors = { name?: string; currency?: string };

export function ProfileForm({ profile, onCancel, onSuccess }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState<Currency>(profile.currency);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = profileSchema.safeParse({ name, currency });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProfile(parsed.data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Perfil actualizado");
      router.refresh();
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Editar perfil</CardTitle>
        <CardDescription>
          Gestiona tus datos y la moneda con la que ves tus gastos.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" value={profile.email} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              El correo no se puede cambiar.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Moneda</Label>
            <Select
              items={currencyItems}
              value={currency}
              onValueChange={(value) => setCurrency(value as Currency)}
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
            <p className="text-xs text-muted-foreground">
              Se usa para mostrar el precio de todas tus suscripciones.
            </p>
          </div>
        </CardContent>

        <CardFooter className="mt-6 flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
