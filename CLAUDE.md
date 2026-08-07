# CLAUDE.md — Attendance Tracking (Inscripción y Asistencia Infantil)

Reglas de trabajo para este proyecto. Léelas antes de generar o modificar código.

## 1. Resumen del proyecto

PWA para que el staff de la iglesia inscriba niños en eventos y controle su asistencia
(código de entrada por inscripción, búsqueda por código, roster con filtros y estadísticas en
vivo). Soporta múltiples eventos y categorías — no un evento único fijo. Requiere sesión
autenticada (Supabase Auth); no hay uso anónimo/kiosco.

Stack: React 19 + TypeScript + Vite + React Router + Supabase + Material UI (MUI). Identidad
visual propia inspirada en la paleta de la iglesia (azul `#060773`, gris `#7B817F`, fondo
`#F0F0F0`, tipografía Montserrat), aplicada como un theme de MUI (`presentation/theme/theme.ts`)
— no se copia el diseño del prototipo funcional usado como referencia de comportamiento, solo su
lógica (formularios, ticket con código, roster, check-in).

## 2. Idioma

- **Todo el código en inglés**: nombres de componentes, variables, funciones, tipos, props,
  archivos, carpetas, mensajes de commit, comentarios.
- El **contenido visible al usuario** (textos de UI, labels, mensajes de error mostrados en
  pantalla) puede estar en español, ya que la app es para usuarios hispanohablantes. Centraliza
  esos textos en un solo lugar (`src/shared/i18n/` o `src/shared/constants/copy.ts`) en vez de
  hardcodearlos por todo el código — así queda claro qué es contenido y qué es lógica.
- Nunca mezclar idiomas dentro de un identificador (nada de `getNiñoById`).

## 3. Arquitectura: Clean Architecture + Atomic Design

Clean Architecture organiza las capas de la app; Atomic Design organiza únicamente la capa de
presentación (UI). No mezclar responsabilidades entre capas.

```
src/
  domain/                  # Entidades y reglas de negocio puras. Sin dependencias externas.
    entities/               # Child.ts, Guardian.ts, Attendance.ts, RegistrationEvent.ts...
    repositories/           # Interfaces (contratos), ej. ChildRepository.ts
  application/              # Casos de uso: orquestan entidades + repositorios.
    useCases/                # registerChild.ts, markAttendance.ts...
  infrastructure/           # Implementaciones concretas de las interfaces del dominio.
    supabase/
      client.ts              # instancia única del cliente Supabase
      repositories/           # SupabaseChildRepository.ts, implementa ChildRepository
      types/                  # tipos generados por `supabase gen types typescript`
  presentation/              # UI. Organizada con Atomic Design, construida sobre MUI.
    theme/
      theme.ts                # theme de MUI (paleta, tipografía, overrides de componentes)
    components/
      atoms/                  # Icon y otros átomos que MUI no cubre directamente...
      molecules/              # composiciones pequeñas de componentes MUI (EventCard...)
      organisms/              # RegistrationForm, AttendanceList, NavBar...
      templates/              # PageLayout, DashboardTemplate...
      pages/                  # RegisterPage, AttendancePage, HomePage...
    hooks/                  # hooks de UI (useChildForm, useAttendance...)
    context/                # providers de React Context si se necesitan
  shared/
    utils/                  # funciones puras reutilizables
    constants/
    types/                  # tipos compartidos (no de dominio)
  App.tsx
  main.tsx
```

Importa con el alias `@/` (ej. `@/domain/entities/Event`) en vez de rutas relativas largas
(`../../../..`); está configurado en `vite.config.ts` y `tsconfig.app.json`.

Navegación con `react-router-dom` (`App.tsx` monta `BrowserRouter` + `Routes`); cada página vive
en `presentation/components/pages/`. No usar estado de pestañas tipo SPA-sin-rutas como en el
prototipo de referencia — cada vista debe tener una URL propia.

Reglas de dependencia (de afuera hacia adentro, nunca al revés):

- `domain/` no importa de ninguna otra capa.
- `application/` importa solo de `domain/`.
- `infrastructure/` implementa interfaces de `domain/` (puede importar Supabase SDK aquí, en
  ningún otro lugar).
- `presentation/` importa `application/` (casos de uso) a través de hooks; nunca llama a
  Supabase directamente desde un componente.

## 4. Componentes: Material UI + composición

- **UI construida con componentes de Material UI** (`@mui/material`): `Button`, `TextField`,
  `Select`, `Card`, `Dialog`, `AppBar`, `Chip`, `Alert`, `CircularProgress`, etc. No reinventar
  estos elementos a mano.
- **Estilizar con el theme** (`presentation/theme/theme.ts`) y el prop `sx`, no con archivos
  `.module.css` por componente — ya no aplica la convención anterior de CSS Modules. Un
  `Component.module.css` solo se justifica para algo que `sx`/el theme genuinamente no puedan
  expresar bien (ej. una animación `@keyframes` compleja); es la excepción, no la regla.
- Cada componente vive en su propia carpeta con su `.tsx` + `index.ts` (re-export):
  ```
  EventCard/
    EventCard.tsx
    index.ts           # export { EventCard } from './EventCard'
  ```
- Un componente = una responsabilidad. Si un archivo `.tsx` supera ~150 líneas o mezcla lógica
  de negocio con presentación, extraer a un hook (`useX`) o dividir en subcomponentes.
- Props tipadas explícitamente con `interface Props { ... }`, sin `any`.
- Componentes funcionales con hooks; nada de clases.
- Un átomo no debe importar de moléculas/organismos (jerarquía estricta hacia abajo). La mayoría
  de los átomos ahora son componentes de MUI usados directamente (no hace falta envolver
  `Button` de MUI en nuestro propio `Button` solo por seguir la convención).

## 5. PWA y responsive

- Usar `vite-plugin-pwa` para manifest + service worker (estrategia `autoUpdate`), configurado en
  `vite.config.ts`.
- `manifest.webmanifest` con iconos en varios tamaños (192, 512, maskable), `theme_color` y
  `background_color` acordes al diseño de referencia. Los iconos actuales (`public/pwa-icon.svg`)
  son un placeholder de marca; reemplazar por artwork final (idealmente PNG/maskable) antes de
  publicar.
- Mobile-first: valores base para mobile en el prop `sx`, escalados hacia arriba con la sintaxis
  responsive de MUI (`sx={{ flexDirection: { xs: 'column', md: 'row' } }}`) o `theme.breakpoints`,
  no media queries de CSS a mano.
- Layout con los componentes de MUI (`Box`, `Stack`, `Grid`, `Container`) en vez de Flexbox/Grid
  escritos a mano; imágenes con `max-width: 100%`.
- Probar que la app sea instalable y funcione razonablemente offline (al menos shell cacheado)
  antes de dar por cerrada una tarea de PWA.

## 6. Supabase

- La app solo la opera staff autenticado (Supabase Auth); no hay flujo público/anónimo. Las
  cuentas se crean manualmente (invitación desde el dashboard de Supabase), sin tabla de perfiles
  propia — cualquier usuario autenticado cuenta como staff. `enable_signup` está deshabilitado en
  `supabase/config.toml` para que nadie pueda auto-registrarse contra la anon key.
- Esquema de datos en `supabase/migrations/` (dos esquemas Postgres, `person` y `event`, según el
  diagrama de `dev/attachment/modelo-bbdd.jpg`): expuestos en la API vía `[api].schemas` en
  `supabase/config.toml`. Al agregar tablas nuevas, crear una migración con
  `npx supabase migration new <nombre>` — no editar migraciones ya aplicadas, crear una nueva.
- Un único cliente (`infrastructure/supabase/client.ts`), inicializado con variables de entorno
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Nunca hardcodear keys. Como las tablas viven en
  `person`/`event` y no en `public`, cada repositorio debe llamar
  `supabase.schema('person' | 'event').from(...)` explícitamente.
- `.env.local` fuera de git (ver `.gitignore`); variables requeridas documentadas en
  `.env.example`.
- Todo acceso a datos pasa por repositorios en `infrastructure/supabase/repositories/`, que
  implementan las interfaces definidas en `domain/repositories/`. La UI y los casos de uso nunca
  importan `@supabase/supabase-js` directamente.
- Regenerar tipos con `npm run gen:types` (requiere `npx supabase link` a un proyecto real)
  después de cada cambio de esquema; no tipar a mano las tablas. Una vez exista
  `infrastructure/supabase/types/database.ts`, tipar el cliente como
  `createClient<Database>(...)`.
- RLS activo en todas las tablas de `person`/`event`, con políticas que solo permiten acceso al
  rol `authenticated` (ver segunda migración); no depender de la anon key para autorización.
- `npm run db:push` aplica las migraciones pendientes al proyecto Supabase enlazado — requiere
  `npx supabase link --project-ref <ref>` primero. Nunca ejecutar `db push` sin que el humano a
  cargo lo confirme explícitamente: es una operación contra una base de datos real.

## 7. Buenas prácticas generales

- TypeScript estricto (`strict: true`); sin `any` salvo caso justificado y comentado.
- Validación de formularios con una librería de esquemas (ej. `zod`) compartida entre
  formulario y caso de uso, no reglas de validación duplicadas.
- Manejo explícito de estados de carga/error/vacío en cualquier vista que dependa de datos
  remotos.
- Accesibilidad: HTML semántico, labels asociados a inputs, contraste de color adecuado,
  navegación por teclado en componentes interactivos.
- ESLint + Prettier como única fuente de estilo; no discutir formato manualmente, correr el
  linter.
- Commits en inglés siguiendo Conventional Commits (`feat:`, `fix:`, `refactor:`...).
- No añadir dependencias nuevas sin necesidad real; evaluar si ya existe una solución con lo
  instalado antes de sumar una librería.
- Sin código muerto, sin `console.log` en el código final, sin comentarios que expliquen qué
  hace el código (el código ya lo dice) — solo comentarios que expliquen un porqué no obvio.

## 8. Testing

- Vitest + React Testing Library para componentes y hooks.
- Casos de uso (`application/`) testeados de forma aislada, mockeando repositorios.
- Tests junto al archivo que prueban: `Button.test.tsx` junto a `Button.tsx`.
