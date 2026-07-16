"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCatalog,
  deleteCatalog,
  updateCatalog,
} from "@/lib/actions/catalog";
import type { CatalogRow } from "@/lib/catalog/serializers";

interface FormValues {
  catalogName: string;
  catalogId: string;
  catalogDescription: string;
  ln: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY: FormValues = {
  catalogName: "",
  catalogId: "",
  catalogDescription: "",
  ln: "es",
  sortOrder: "0",
  isActive: true,
};

function toForm(row: CatalogRow): FormValues {
  return {
    catalogName: row.catalogName,
    catalogId: row.catalogId,
    catalogDescription: row.catalogDescription,
    ln: row.ln,
    sortOrder: String(row.sortOrder),
    isActive: row.isActive,
  };
}

/** Estado del editor: cerrado, creando, o editando una fila concreta. */
type Editing = { mode: "create" } | { mode: "edit"; row: CatalogRow } | null;

export function CatalogAdmin({ rows }: { rows: CatalogRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);

  const groups = useMemo(() => {
    const map = new Map<string, CatalogRow[]>();
    for (const row of rows) {
      const list = map.get(row.catalogName) ?? [];
      list.push(row);
      map.set(row.catalogName, list);
    }
    return [...map.entries()];
  }, [rows]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catálogos</h1>
          <p className="text-sm text-muted-foreground">
            Opciones de los formularios. Los códigos con lógica de negocio
            (ANNUAL, BIWEEKLY, ACTIVE…) no deben renombrarse.
          </p>
        </div>
        <Button onClick={() => setEditing({ mode: "create" })}>
          <Plus data-icon="inline-start" />
          Nueva opción
        </Button>
      </div>

      {editing && (
        <CatalogForm
          initial={editing.mode === "edit" ? toForm(editing.row) : EMPTY}
          rowId={editing.mode === "edit" ? editing.row.id : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {groups.map(([catalogName, items]) => (
        <Card key={catalogName}>
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase tracking-wide">
              {catalogName}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {items.map((row) => (
              <CatalogRowItem
                key={row.id}
                row={row}
                onEdit={() => setEditing({ mode: "edit", row })}
                onDeleted={() => router.refresh()}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CatalogRowItem({
  row,
  onEdit,
  onDeleted,
}: {
  row: CatalogRow;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCatalog(row.id);
    setIsDeleting(false);
    if (!result.ok) {
      toast.error(result.error);
      setConfirming(false);
      return;
    }
    toast.success("Opción eliminada");
    onDeleted();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm">{row.catalogId}</span>
          <Badge variant="secondary">{row.ln}</Badge>
          {!row.isActive && <Badge variant="outline">inactiva</Badge>}
        </div>
        <span className="text-sm text-muted-foreground">
          {row.catalogDescription} · orden {row.sortOrder}
        </span>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirming(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar">
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setConfirming(true)}
            aria-label="Eliminar"
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}

function CatalogForm({
  initial,
  rowId,
  onClose,
  onSaved,
}: {
  initial: FormValues;
  rowId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<FormValues>(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = rowId !== null;

  const set = <K extends keyof FormValues>(field: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const payload = { ...values, sortOrder: Number(values.sortOrder) };
    const result = isEditing
      ? await updateCatalog(rowId, payload)
      : await createCatalog(payload);
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? "Opción actualizada" : "Opción creada");
    onSaved();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar opción" : "Nueva opción"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="catalogName">Catálogo</Label>
            <Input
              id="catalogName"
              placeholder="CATEGORY, CICLFACT..."
              value={values.catalogName}
              onChange={(e) => set("catalogName", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="catalogId">Código</Label>
            <Input
              id="catalogId"
              placeholder="STREAMING"
              value={values.catalogId}
              onChange={(e) => set("catalogId", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="catalogDescription">Descripción (label)</Label>
            <Input
              id="catalogDescription"
              placeholder="Streaming"
              value={values.catalogDescription}
              onChange={(e) => set("catalogDescription", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ln">Idioma</Label>
            <Input
              id="ln"
              placeholder="es"
              value={values.ln}
              onChange={(e) => set("ln", e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sortOrder">Orden</Label>
            <Input
              id="sortOrder"
              type="number"
              min="0"
              value={values.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              className="size-4"
              checked={values.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
            />
            Activa (visible en los formularios)
          </label>
        </CardContent>

        <CardFooter className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear opción"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
