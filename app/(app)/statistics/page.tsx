import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getCatalog } from "@/lib/catalog/catalog";
import { toSubscriptionDTO } from "@/lib/subscriptions/serializers";
import { StatisticsView } from "@/components/statistics/statistics-view";

export const metadata: Metadata = {
  title: "Estadísticas",
};

export default async function StatisticsPage() {
  const session = await requireSession();

  const [user, subscriptions, catalog] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { currency: true },
    }),
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    getCatalog(),
  ]);

  return (
    <StatisticsView
      subscriptions={subscriptions.map((sub) => toSubscriptionDTO(sub, catalog))}
      currency={user.currency}
      catalog={catalog}
    />
  );
}
