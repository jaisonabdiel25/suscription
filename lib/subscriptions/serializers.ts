import type { Subscription } from "@/lib/generated/prisma/client";
import { CATALOG_NAMES } from "@/lib/catalog/seed-data";
import { catalogLabel, type CatalogData } from "@/lib/catalog/serializers";

// Prisma's Decimal cannot cross the RSC/Server Action boundary, so the client
// only ever sees this plain-object shape. `category`/`importance`/`billingCycle`/
// `status` son códigos de catálogo (catalogId); los `*Label` traen el texto ya
// resuelto para el idioma pedido, así los componentes no tocan el catálogo.
export type SubscriptionDTO = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  paymentDay: number;
  secondPaymentDay: number | null;
  paymentMonth: number | null;
  importance: string;
  importanceLabel: string;
  price: number;
  billingCycle: string;
  billingCycleLabel: string;
  status: string;
  statusLabel: string;
  notes: string | null;
  url: string | null;
};

export function toSubscriptionDTO(
  subscription: Subscription,
  catalog: CatalogData
): SubscriptionDTO {
  return {
    id: subscription.id,
    name: subscription.name,
    category: subscription.category,
    categoryLabel: catalogLabel(
      catalog,
      CATALOG_NAMES.CATEGORY,
      subscription.category
    ),
    paymentDay: subscription.paymentDay,
    secondPaymentDay: subscription.secondPaymentDay,
    paymentMonth: subscription.paymentMonth,
    importance: subscription.importance,
    importanceLabel: catalogLabel(
      catalog,
      CATALOG_NAMES.IMPORTANCY,
      subscription.importance
    ),
    price: Number(subscription.price),
    billingCycle: subscription.billingCycle,
    billingCycleLabel: catalogLabel(
      catalog,
      CATALOG_NAMES.CICLFACT,
      subscription.billingCycle
    ),
    status: subscription.status,
    statusLabel: catalogLabel(
      catalog,
      CATALOG_NAMES.STATUS,
      subscription.status
    ),
    notes: subscription.notes,
    url: subscription.url,
  };
}
