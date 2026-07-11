import type { Subscription } from "@/lib/generated/prisma/client";
import type {
  BillingCycle,
  Category,
  Importance,
  SubscriptionStatus,
} from "@/lib/generated/prisma/enums";

// Prisma's Decimal cannot cross the RSC/Server Action boundary, so the client
// only ever sees this plain-object shape.
export type SubscriptionDTO = {
  id: string;
  name: string;
  category: Category;
  paymentDay: number;
  importance: Importance;
  price: number;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  notes: string | null;
  url: string | null;
};

export function toSubscriptionDTO(subscription: Subscription): SubscriptionDTO {
  return {
    id: subscription.id,
    name: subscription.name,
    category: subscription.category,
    paymentDay: subscription.paymentDay,
    importance: subscription.importance,
    price: Number(subscription.price),
    billingCycle: subscription.billingCycle,
    status: subscription.status,
    notes: subscription.notes,
    url: subscription.url,
  };
}
