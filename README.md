# HurgoTrack · Frontend

Next.js 16 (App Router) + React 19 + Tailwind CSS 4. Solo estructura y configuración de servicios: sin diseño ni lógica de negocio.

```
app/
  (app)/        Rutas privadas (layout con RequireAuth)
  auth/         Rutas públicas de autenticación
  api/health    Estado de Redis y del backend
  api/steps/    Estado de flujos por pasos en Redis (GET/PUT/DELETE /api/steps/<key>)
components/     ui/, layout/, shared/, auth/ (guards)
context/        AuthProvider (sesión con cookies JWT httpOnly)
hooks/          useAuth, usePermissions, useStepper, useWorkflow, useDebouncedValue, useStorageValue
lib/            api.client (axios + refresh), redis, cache, stepsStore (solo servidor)
services/       auth, workflow (sync / async / RunStepSync), steps (cliente de /api/steps), generics/
types/  utils/
```

## Backend

`NEXT_PUBLIC_API_URL` (por defecto `https://hurgotrackback.devloop.com.co/api`). Auth por cookies; cada acción de
negocio es un workflow: `runWorkflow('trips.list', { data })` → `POST /api/workflows/sync/trips.list/`.

## Redis

Solo desde el servidor de Next (`REDIS_URL`, `REDIS_KEY_PREFIX`). `useStepper({ persistKey })` guarda/retoma el
flujo; `lib/cache.ts` ofrece `remember()` para cachear respuestas.

## Desarrollo (desde la terminal de Ubuntu/WSL)

```bash
cp .env.example .env.local
npm install
npm run dev     # http://localhost:3000
```
