import type { SubscriptionDTO } from "./serializers";

export const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function isAnnual(subscription: SubscriptionDTO): boolean {
  return subscription.billingCycle === "ANNUAL";
}

/**
 * Monthly spend a recurring subscription represents. Biweekly subs are charged
 * twice a month, so they count double. Annual subs are billed once a year and
 * are excluded from the monthly view entirely (returns 0).
 */
export function monthlyEquivalent(subscription: SubscriptionDTO): number {
  switch (subscription.billingCycle) {
    case "BIWEEKLY":
      return subscription.price * 2;
    case "ANNUAL":
      return 0;
    default:
      return subscription.price;
  }
}

/**
 * The two days of the month a biweekly subscription is charged, sorted
 * ascending. Falls back to a day ~15 apart for legacy rows saved before the
 * second day was stored.
 */
export function biweeklyPaymentDays(
  subscription: SubscriptionDTO
): [number, number] {
  const first = subscription.paymentDay;
  const second =
    subscription.secondPaymentDay ?? (first <= 15 ? first + 15 : first - 15);
  return first <= second ? [first, second] : [second, first];
}

/** Last day of the given month, e.g. Feb 2025 -> 28. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Next occurrence of `day` on or after `from`, clamped to each month's length. */
function nextMonthlyDate(day: number, from: Date): Date {
  const clamp = (year: number, month: number) =>
    Math.min(day, daysInMonth(year, month));

  const year = from.getFullYear();
  const month = from.getMonth();
  const dayThisMonth = clamp(year, month);

  if (dayThisMonth >= from.getDate()) {
    return new Date(year, month, dayThisMonth);
  }
  const next = new Date(year, month + 1, 1);
  return new Date(
    next.getFullYear(),
    next.getMonth(),
    clamp(next.getFullYear(), next.getMonth())
  );
}

/**
 * Next date the subscription is charged, accounting for its billing cycle.
 * Days 29-31 are clamped to the last day of shorter months.
 */
export function getNextPaymentDate(
  subscription: SubscriptionDTO,
  from = new Date()
): Date {
  if (subscription.billingCycle === "ANNUAL") {
    const month = (subscription.paymentMonth ?? 1) - 1;
    const year = from.getFullYear();
    const day = Math.min(subscription.paymentDay, daysInMonth(year, month));
    const thisYear = new Date(year, month, day);
    if (thisYear >= startOfDay(from)) return thisYear;
    const nextYear = year + 1;
    return new Date(
      nextYear,
      month,
      Math.min(subscription.paymentDay, daysInMonth(nextYear, month))
    );
  }

  if (subscription.billingCycle === "BIWEEKLY") {
    const [first, second] = biweeklyPaymentDays(subscription);
    const a = nextMonthlyDate(first, from);
    const b = nextMonthlyDate(second, from);
    return a <= b ? a : b;
  }

  return nextMonthlyDate(subscription.paymentDay, from);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysUntilNextPayment(
  subscription: SubscriptionDTO,
  from = new Date()
): number {
  const today = startOfDay(from);
  const next = getNextPaymentDate(subscription, from);
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

/** Just the payment date, e.g. "5 de marzo", "Días 5 y 20" or "Día 5". */
export function paymentDateLabel(subscription: SubscriptionDTO): string {
  if (subscription.billingCycle === "ANNUAL") {
    const month = MONTH_NAMES[(subscription.paymentMonth ?? 1) - 1];
    return `${subscription.paymentDay} de ${month}`;
  }
  if (subscription.billingCycle === "BIWEEKLY") {
    const [first, second] = biweeklyPaymentDays(subscription);
    return `Días ${first} y ${second}`;
  }
  return `Día ${subscription.paymentDay}`;
}

/** Human-readable schedule, e.g. "Se paga el 5 de marzo" or "los días 5 y 20". */
export function paymentScheduleLabel(subscription: SubscriptionDTO): string {
  if (subscription.billingCycle === "ANNUAL") {
    const month = MONTH_NAMES[(subscription.paymentMonth ?? 1) - 1];
    return `Se paga el ${subscription.paymentDay} de ${month}`;
  }
  if (subscription.billingCycle === "BIWEEKLY") {
    const [first, second] = biweeklyPaymentDays(subscription);
    return `Se paga los días ${first} y ${second}`;
  }
  return `Se paga el día ${subscription.paymentDay}`;
}
