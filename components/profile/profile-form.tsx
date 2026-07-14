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
import { CATALOG_NAMES } from "@/lib/catalog/seed-data";
import { catalogOptions, type CatalogData } from "@/lib/catalog/serializers";
import { profileSchema } from "@/lib/validations/profile";

interface ProfileFormProps {
  profile: { name: string; email: string; currency: string };
  catalog: CatalogData;
  /** Called on Cancel. */
  onCancel?: () => void;
  /** Called after a successful save. */
  onSuccess?: () => void;
}

type FieldErrors = { name?: string; currency?: string };

export function ProfileForm({
  profile,
  catalog,
  onCancel,
  onSuccess,
}: ProfileFormProps) {
  const router = useRouter();
  const currencyItems = catalogOptions(catalog, CATALOG_NAMES.CURRENCY).map(
    (option) => ({ value: option.code, label: option.label })
  );
  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = () => {
    const parsed = profileSchema.safeParse({ name, currency });
    const message = parsed.success
      ? undefined
      : parsed.error.issues.find((issue) => issue.path[0] === "name")?.message;
    setErrors((prev) => ({ ...prev, name: message }));
  };

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
        <CardTitle role="heading" aria-level={1}>
          Editar perfil
        </CardTitle>
        <CardDescription>
          Gestiona tus datos y la moneda con la que ves tus gastos.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Nombre
              <span aria-hidden="true" className="text-destructive">
                {" "}
                *
              </span>
            </Label>
            <Input
              id="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              onBlur={validateName}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="text-xs text-destructive">
                {errors.name}
              </p>
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
              onValueChange={(value) => setCurrency(value ?? "")}
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
