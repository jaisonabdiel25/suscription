import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { toSubscriptionDTO } from "@/lib/subscriptions/serializers";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";

type PageParams = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { id } = await params;
  return { title: id === "new" ? "Nueva suscripción" : "Editar suscripción" };
}

export default async function SubscriptionFormPage({ params }: PageParams) {
  const { id } = await params;
  const session = await requireSession();
  const isNew = id === "new";

  const subscription = isNew
    ? null
    : await prisma.subscription.findFirst({
        where: { id, userId: session.user.id },
      });

  if (!isNew && !subscription) notFound();

  return (
    <SubscriptionForm
      subscription={subscription ? toSubscriptionDTO(subscription) : null}
    />
  );
}
