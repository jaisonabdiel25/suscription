"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Currency } from "@/lib/generated/prisma/enums";
import { CURRENCY_LABELS } from "@/lib/subscriptions/utils";
import { ProfileForm } from "./profile-form";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

interface ProfileCardProps {
  profile: { name: string; email: string; currency: Currency };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ProfileForm
        profile={profile}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardTitle>Mi perfil</CardTitle>
            <CardDescription>
              Tus datos y la moneda con la que ves tus gastos.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Pencil data-icon="inline-start" />
            Editar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Field label="Nombre">{profile.name}</Field>
        <Field label="Correo electrónico">{profile.email}</Field>
        <Field label="Moneda">{CURRENCY_LABELS[profile.currency]}</Field>
      </CardContent>
    </Card>
  );
}
