import { CalendarDays, Flag, Wallet } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Organiza con categorías y fechas",
    description:
      "Clasifica cada suscripción por categoría y registra el día del mes en que se cobra.",
  },
  {
    icon: Flag,
    title: "Prioriza por importancia",
    description:
      "Marca qué tan importante es cada servicio y detecta cuáles podrías cancelar.",
  },
  {
    icon: Wallet,
    title: "Conoce tu gasto real",
    description:
      "Ve tu gasto mensual total de un vistazo, incluyendo el equivalente de los pagos anuales.",
  },
];

export function Features() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-8 pb-24 md:pt-12">
      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="mb-2 size-5 text-muted-foreground" />
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
