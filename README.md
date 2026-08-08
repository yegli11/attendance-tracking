# Attendance Tracking

PWA para inscripción y control de asistencia de niños a eventos. React 19 + TypeScript + Vite +
React Router, con Supabase como backend.

Ver [CLAUDE.md](./CLAUDE.md) para arquitectura, convenciones y reglas de trabajo del proyecto.

## Scripts

```bash
npm run dev          # servidor de desarrollo
npm run build        # typecheck + build de producción
npm run preview      # sirve el build de producción localmente
npm run lint         # ESLint
npm run test         # tests con Vitest (una vez)
npm run test:watch   # tests con Vitest (watch mode)
npm run db:push      # aplica las migraciones al proyecto Supabase enlazado
npm run gen:types    # regenera los tipos TypeScript desde el esquema de Supabase
```

## Supabase

1. Copia `.env.example` a `.env.local` y complétalo con la URL y anon key de tu proyecto
   (Supabase Dashboard → Settings → API).
2. Enlaza el proyecto: `npx supabase link --project-ref <tu-project-ref>`.
3. Aplica el esquema (`supabase/migrations/`): `npm run db:push`.
4. Genera los tipos TypeScript del esquema: `npm run gen:types`.

El esquema vive en dos schemas de Postgres, `person` y `event` (ver
`dev/attachment/modelo-bbdd.jpg`), expuestos en la API vía `supabase/config.toml`. Solo usuarios
autenticados (staff invitado manualmente desde el dashboard) pueden leer o escribir datos — no
hay registro público ni acceso anónimo.
