"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteSubscription } from "@/lib/actions/subscriptions";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import {
  daysUntilNextPayment,
  monthlyEquivalent,
} from "@/lib/subscriptions/utils";

export interface UpcomingPayment {
  subscription: SubscriptionDTO;
  daysLeft: number;
}

export interface SubscriptionsSummary {
  activeCount: number;
  pausedCount: number;
  /** Total monthly spend (annual prices divided by 12), active subs only. */
  monthlyTotal: number;
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
      monthlyTotal,
      upcoming,
    };
  }, [subscriptions]);

  return { subscriptions, remove, summary };
}
