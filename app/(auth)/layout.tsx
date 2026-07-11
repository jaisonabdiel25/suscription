import Link from "next/link";
import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Wallet className="size-5" />
        Suscripciones
      </Link>
      {children}
    </div>
  );
}
