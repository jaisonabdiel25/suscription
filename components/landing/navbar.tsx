import Link from "next/link";
import { Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Wallet className="size-5" />
          Subly
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href="/dashboard" className={buttonVariants()}>
              Ir al dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                Iniciar sesión
              </Link>
              <Link href="/signup" className={buttonVariants()}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
