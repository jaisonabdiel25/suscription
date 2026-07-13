
## Arquitectura

**Stack:** Next.js 16 (App Router, React 19), Prisma 7 + PostgreSQL, better-auth, Tailwind v4, UI estilo shadcn (primitivas de Base UI), Zod v4. El alias de ruta `@/*` apunta a la raíz del repositorio.

**Grupos de rutas** bajo `app/`:
- `(auth)` — `/login`, `/signup`. Públicas.
- `(app)` — `/dashboard`, `/profile`, `/statistics`, `/subscriptions/[id]`. El layout del grupo llama a `requireSession()`, que redirige a `/login` cuando no hay sesión, así que toda página dentro del grupo está autenticada.
- `app/api/auth/[...all]/route.ts` — el handler catch-all de better-auth.

**Autenticación** (`lib/auth.ts`, `lib/session.ts`, `lib/auth-client.ts`): better-auth con email/contraseña y el adaptador de Prisma. El código de servidor obtiene la sesión con `getSession()` (puede ser null) o `requireSession()` (redirige). Los componentes de cliente usan `authClient` / `useSession` desde `lib/auth-client.ts`.

**Flujo de datos — este es el patrón central:**
1. Las páginas Server Component (p. ej. `app/(app)/dashboard/page.tsx`) consultan Prisma directamente y pasan los datos a un componente de cliente `*-view`.
2. El `Decimal` de Prisma (el `price` de la suscripción) **no puede cruzar la frontera entre Server Component / Server Action.** Convierte siempre las filas con `toSubscriptionDTO()` (`lib/subscriptions/serializers.ts`) antes de entregarlas al código de cliente — transforma `Decimal` en `number` y produce la forma `SubscriptionDTO` que consume todo el árbol de cliente.
3. Las mutaciones viven en `lib/actions/*.ts` (`"use server"`). Devuelven un `ActionResult<T>` discriminado (`{ ok: true, data } | { ok: false, error }`) en lugar de lanzar excepciones, revalidan la entrada con el esquema Zod compartido, acotan cada consulta por `session.user.id` y hacen `revalidatePath("/dashboard")`.
4. La propiedad se garantiza incluyendo `userId` en la cláusula `where` de Prisma (p. ej. `update({ where: { id, userId } })`); una discrepancia lanza `P2025`, que la acción mapea a un error de "no encontrado".

**Estado de cliente:** los hooks en `hooks/` son dueños de la capa interactiva. `use-subscriptions.ts` mantiene la lista en `useState` (inicializada desde props del servidor), calcula el `summary` (totales/próximos) con `useMemo`, y actualiza de forma optimista al eliminar. `use-subscription-form.ts` es un formulario controlado validado contra el **mismo** `subscriptionSchema` usado en el servidor.

**Lógica de dominio** vive en `lib/subscriptions/utils.ts` — cálculos de ciclo de facturación y formato usados en toda la UI. Reglas clave:
- Las suscripciones `BIWEEKLY` se cobran dos veces al mes → `monthlyEquivalent` las cuenta como `price * 2`; las `ANNUAL` aportan `0` al gasto mensual.
- Total anual global = `monthlyTotal * 12 + annualTotal` (ver `use-subscriptions.ts`).
- El cálculo del día de pago ajusta los días 29–31 a la longitud real de cada mes; las suscripciones quincenales guardan dos días de pago, las anuales guardan un `paymentMonth`.

**Validación** (`lib/validations/subscription.ts`): un único esquema Zod es la fuente de verdad tanto para cliente como para servidor. Coacciona las entradas de texto del formulario a números, usa `superRefine` para campos obligatorios que dependen del ciclo (la anual necesita `paymentMonth`; la quincenal necesita un `secondPaymentDay` distinto), y un `transform` final anula los campos que no aplican al ciclo elegido — así, cambiar de ciclo durante una edición mantiene la fila consistente.
