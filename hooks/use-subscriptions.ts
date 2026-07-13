"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteSubscription } from "@/lib/actions/subscriptions";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import {
  daysUntilNextPayment,
  isAnnual,
  monthlyEquivalent,
} from "@/lib/subscriptions/utils";

export interface UpcomingPayment {
  subscription: SubscriptionDTO;
  daysLeft: number;
}

export interface SubscriptionsSummary {
  activeCount: number;
  pausedCount: number;
  /** Monthly spend from recurring (monthly + biweekly) subs, active only. */
  monthlyTotal: number;
  /** Yearly spend from annual subs, active only. */
  annualTotal: number;
  /** Total yearly spend across every active sub (recurring × 12 + annual). */
  yearlyTotal: number;
  /** Active subscriptions charged within the next 7 days, soonest first. */
  upcoming: UpcomingPayment[];
}

export function useSubscriptions(initialSubscriptions: SubscriptionDTO[]) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);

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

    const monthlyTotal = active.reduce(
      (sum, sub) => sum + monthlyEquivalent(sub),
      0
    );

    const annualTotal = active
      .filter(isAnnual)
      .reduce((sum, sub) => sum + sub.price, 0);

    const upcoming = active
      .map((sub) => ({
        subscription: sub,
        daysLeft: daysUntilNextPayment(sub),
      }))
      .filter((entry) => entry.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return {
      activeCount: active.length,
      pausedCount: subscriptions.length - active.length,
      monthlyTotal,
      annualTotal,
      yearlyTotal: monthlyTotal * 12 + annualTotal,
      upcoming,
    };
  }, [subscriptions]);

  return { subscriptions, remove, summary };
}
