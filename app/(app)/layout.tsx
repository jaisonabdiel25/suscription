import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <Header userName={session.user.name} isAdmin={user?.isAdmin ?? false} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
