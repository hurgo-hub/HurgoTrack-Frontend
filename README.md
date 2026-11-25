# HurgoTrack · Frontend

Next.js 16 (App Router) + React 19 + Tailwind CSS 4. Base tomada de FigaPay: solo estructura, sin lógica de negocio.

```
app/            Rutas. (app)/ privadas (dashboard, trips, orders, fleet, drivers, locations), auth/login
  api/health    Estado de Redis y del backend
  api/steps/    Estado de flujos por pasos en Redis (GET/PUT/DELETE /api/steps/<key>)
components/     UI/ (botones, campos, modal…), layout/, auth/ (guards), steps/ (Stepper)
context/        AuthProvider (sesión con cookies JWT httpOnly)
hooks/          useAuth, usePermissions, useStepper, useWorkflow, useToast…
lib/            api.client (axios + refresh), redis, cache, stepsStore (solo servidor)
services/       auth, workflow (sync / async / RunStepSync), steps (cliente de /api/steps)
```

## Backend

`NEXT_PUBLIC_API_URL` (por defecto `https://hurgotrackback.devloop.com.co/api`). Auth por cookies; cada acción de
negocio es un workflow: `runWorkflow('trips.list', { data })` → `POST /api/workflows/sync/trips.list/`.

## Redis

Solo desde el servidor de Next (`REDIS_URL`, `REDIS_KEY_PREFIX`). `useStepper({ persistKey })` guarda/retoma el
flujo; `lib/cache.ts` ofrece `remember()` para cachear respuestas.

## Desarrollo

```bash
cp .env.example .env.local
npm install
npm run dev     # http://localhost:3000
```
