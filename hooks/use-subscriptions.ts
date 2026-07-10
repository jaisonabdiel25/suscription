"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createSubscription,
  deleteSubscription,
  updateSubscription,
} from "@/lib/actions/subscriptions";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import type { SubscriptionInput } from "@/lib/validations/subscription";
import {
  daysUntilNextPayment,
  monthlyEquivalent,
} from "@/lib/subscriptions/utils";
import type { Currency } from "@/lib/generated/prisma/enums";

export interface UpcomingPayment {
  subscription: SubscriptionDTO;
  daysLeft: number;
}

export interface SubscriptionsSummary {
  activeCount: number;
  pausedCount: number;
  /** Monthly spend per currency (annual prices divided by 12), active subs only. */
  monthlyTotals: Array<{ currency: Currency; total: number }>;
  /** Active subscriptions charged within the next 7 days, soonest first. */
  upcoming: UpcomingPayment[];
}

export function useSubscriptions(initialSubscriptions: SubscriptionDTO[]) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);

  const create = async (input: SubscriptionInput): Promise<boolean> => {
    const result = await createSubscription(input);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setSubscriptions((prev) => [result.data, ...prev]);
    toast.success("Suscripción creada");
    return true;
  };

  const update = async (
    id: string,
    input: SubscriptionInput
  ): Promise<boolean> => {
    const result = await updateSubscription(id, input);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? result.data : sub))
    );
    toast.success("Suscripción actualizada");
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    const result = await deleteSubscription(id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    toast.success("Suscripción eliminada");
    return true;
  };

  const summary = useMemo<SubscriptionsSummary>(() => {
    const active = subscriptions.filter((sub) => sub.status === "ACTIVE");

    const totals = new Map<Currency, number>();
    for (const sub of active) {
      totals.set(sub.currency, (totals.get(sub.currency) ?? 0) + monthlyEquivalent(sub));
    }

    const upcoming = active
      .map((sub) => ({
        subscription: sub,
        daysLeft: daysUntilNextPayment(sub.paymentDay),
      }))
      .filter((entry) => entry.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return {
      activeCount: active.length,
      pausedCount: subscriptions.length - active.length,
      monthlyTotals: [...totals.entries()].map(([currency, total]) => ({
        currency,
        total,
      })),
      upcoming,
    };
  }, [subscriptions]);

  return { subscriptions, create, update, remove, summary };
}
