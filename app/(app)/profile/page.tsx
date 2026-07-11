import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ProfileCard } from "@/components/profile/profile-card";

export const metadata: Metadata = {
  title: "Perfil",
};

export default async function ProfilePage() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, currency: true },
  });

  return <ProfileCard profile={user} />;
}
