import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { toSubscriptionDTO } from "@/lib/subscriptions/serializers";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";

type PageParams = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { id } = await params;
  return { title: id === "new" ? "Nueva suscripción" : "Suscripción" };
}

export default async function SubscriptionPage({ params }: PageParams) {
  const { id } = await params;
  const session = await requireSession();
  const isNew = id === "new";

  if (isNew) {
    return <SubscriptionForm subscription={null} />;
  }

  const [user, subscription] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { currency: true },
    }),
    prisma.subscription.findFirst({
      where: { id, userId: session.user.id },
    }),
  ]);

  if (!subscription) notFound();

  return (
    <SubscriptionCard
      subscription={toSubscriptionDTO(subscription)}
      currency={user.currency}
    />
  );
}
