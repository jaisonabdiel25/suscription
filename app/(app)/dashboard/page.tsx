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

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <SubscriptionsView
      initialSubscriptions={subscriptions.map(toSubscriptionDTO)}
    />
  );
}
