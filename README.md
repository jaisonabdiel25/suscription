# Subly

Gestor personal de suscripciones. Registra tus servicios recurrentes (streaming, música, productividad, etc.), cada uno con su ciclo de facturación, y consulta de un vistazo tu gasto mensual, tu total anual y los próximos pagos.

## Características

- **Autenticación** con email y contraseña.
- **Suscripciones** con categoría, importancia, precio, notas y URL.
- **Ciclos de facturación:** mensual, quincenal (dos cobros al mes) y anual.
- **Resumen de gastos:** gasto mensual, total anual global y próximos pagos de los siguientes 7 días.
- **Estadísticas** para visualizar la distribución de tus suscripciones.
- **Moneda por usuario** (COP, USD, EUR) y **tema claro/oscuro**.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Base de datos:** PostgreSQL con Prisma 7 (driver adapter `@prisma/adapter-pg`)
- **Autenticación:** better-auth
- **UI:** Tailwind CSS v4, componentes estilo shadcn sobre primitivas de Base UI, Recharts para gráficos
- **Validación:** Zod v4
- **Gestor de paquetes:** pnpm

## Requisitos

- Node.js 20+
- pnpm
- Una base de datos PostgreSQL

## Puesta en marcha

1. **Instala las dependencias:**

   ```bash
   pnpm install
   ```

2. **Configura las variables de entorno.** Crea un archivo `.env` en la raíz con tu cadena de conexión de PostgreSQL:

   ```bash
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/subly"
   ```

3. **Aplica las migraciones y genera el cliente de Prisma:**

   ```bash
   npx prisma migrate dev
   ```

4. **Arranca el servidor de desarrollo:**

   ```bash
   pnpm dev
   ```

   La app queda disponible en [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | Ejecuta ESLint |
| `npx tsc --noEmit` | Verificación de tipos |

## Base de datos

El esquema vive en [`prisma/schema.prisma`](prisma/schema.prisma) y el cliente se genera en `lib/generated/prisma`.

```bash
npx prisma migrate dev --name <nombre>   # Crea y aplica una migración
npx prisma generate                      # Regenera el cliente
npx prisma studio                        # Inspecciona los datos
```

## Estructura del proyecto

```
app/
  (auth)/          Rutas públicas: login y registro
  (app)/           Rutas autenticadas: dashboard, perfil, estadísticas, detalle
  api/auth/        Handler de better-auth
components/        Componentes de UI y de dominio
hooks/             Estado de cliente (suscripciones, formularios, auth)
lib/
  actions/         Server Actions (mutaciones)
  subscriptions/   Serializadores y lógica de dominio (cálculos de facturación)
  validations/     Esquemas de Zod compartidos cliente/servidor
prisma/            Esquema y migraciones
```

> Para detalles de arquitectura y convenciones internas, consulta [CLAUDE.md](CLAUDE.md).
