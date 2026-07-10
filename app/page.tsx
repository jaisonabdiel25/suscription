import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { getSession } from "@/lib/session";

export default async function LandingPage() {
  const session = await getSession();
  const isAuthenticated = Boolean(session);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <Features />
      </main>
      <footer className="border-t py-6">
        <p className="mx-auto w-full max-w-5xl px-4 text-sm text-muted-foreground">
          Suscripciones — controla tus gastos recurrentes.
        </p>
      </footer>
    </div>
  );
}
