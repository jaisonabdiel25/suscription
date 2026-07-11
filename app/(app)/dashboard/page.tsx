import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { toSubscriptionDTO } from "@/lib/subscriptions/serializers";
import { SubscriptionsView } from "@/components/subscriptions/subscriptions-view";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireSession();

  const [user, subscriptions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { currency: true },
    }),
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <SubscriptionsView
      initialSubscriptions={subscriptions.map(toSubscriptionDTO)}
      currency={user.currency}
    />
  );
}
