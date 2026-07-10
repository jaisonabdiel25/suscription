import type {
  BillingCycle,
  Category,
  Currency,
  Importance,
  SubscriptionStatus,
} from "@/lib/generated/prisma/enums";
import type { SubscriptionDTO } from "./serializers";

export const CATEGORY_LABELS: Record<Category, string> = {
  STREAMING: "Streaming",
  MUSICA: "Música",
  PRODUCTIVIDAD: "Productividad",
  EDUCACION: "Educación",
  SALUD: "Salud",
  GAMING: "Gaming",
  OTROS: "Otros",
};

export const IMPORTANCE_LABELS: Record<Importance, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Mensual",
  ANNUAL: "Anual",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  COP: "COP — Peso colombiano",
  USD: "USD — Dólar",
  EUR: "EUR — Euro",
};

export function formatPrice(price: number, currency: Currency): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function monthlyEquivalent(subscription: SubscriptionDTO): number {
  return subscription.billingCycle === "ANNUAL"
    ? subscription.price / 12
    : subscription.price;
}

/**
 * Next date the subscription is charged. Days 29-31 are clamped to the
 * last day of months that are shorter (e.g. day 31 in February -> Feb 28/29).
 */
export function getNextPaymentDate(paymentDay: number, from = new Date()): Date {
  const clamp = (year: number, month: number) =>
    Math.min(paymentDay, new Date(year, month + 1, 0).getDate());

  const year = from.getFullYear();
  const month = from.getMonth();
  const dayThisMonth = clamp(year, month);

  if (dayThisMonth >= from.getDate()) {
    return new Date(year, month, dayThisMonth);
  }
  const nextMonth = new Date(year, month + 1, 1);
  return new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth(),
    clamp(nextMonth.getFullYear(), nextMonth.getMonth())
  );
}

export function daysUntilNextPayment(paymentDay: number, from = new Date()): number {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const next = getNextPaymentDate(paymentDay, from);
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}
