"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Wallet } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header({ userName }: { userName: string }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Wallet className="size-5" />
          Suscripciones
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/profile"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <User data-icon="inline-start" />
            <span className="hidden max-w-48 truncate sm:inline">
              {userName}
            </span>
            <span className="sm:hidden">Perfil</span>
          </Link>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut data-icon="inline-start" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
