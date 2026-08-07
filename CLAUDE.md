# CLAUDE.md — Registration System (Inscripción y Asistencia Infantil)

Reglas de trabajo para este proyecto. Léelas antes de generar o modificar código.

## 1. Resumen del proyecto

App web para inscripción y control de asistencia de niños (ver referencia visual en
`../attachment/concentracion-infantil.html` y modelo de datos en `../attachment/modelo-bbdd.jpg`).
Stack actual: React 19 + TypeScript + Vite. Debe evolucionar como **PWA responsive** con
**Supabase** como backend.

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
  presentation/              # UI. Organizada con Atomic Design.
    components/
      atoms/                  # Button, Input, Badge, Avatar...
      molecules/              # FormField, SearchBar, ChildCard...
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

Reglas de dependencia (de afuera hacia adentro, nunca al revés):

- `domain/` no importa de ninguna otra capa.
- `application/` importa solo de `domain/`.
- `infrastructure/` implementa interfaces de `domain/` (puede importar Supabase SDK aquí, en
  ningún otro lugar).
- `presentation/` importa `application/` (casos de uso) a través de hooks; nunca llama a
  Supabase directamente desde un componente.

## 4. Componentes: un archivo por responsabilidad

Cada componente vive en su propia carpeta dentro del nivel atómico que le corresponde:

```
Button/
  Button.tsx
  Button.module.css
  Button.types.ts   # solo si las props ameritan un archivo aparte
  index.ts           # re-export: export { Button } from './Button'
```

- **CSS Modules** (`Component.module.css`), no CSS-in-JS ni estilos globales sueltos. Evita
  colisión de clases y mantiene el estilo junto a su componente.
- Un componente = una responsabilidad. Si un archivo `.tsx` supera ~150 líneas o mezcla lógica
  de negocio con presentación, extraer a un hook (`useX`) o dividir en subcomponentes.
- Props tipadas explícitamente con `interface Props { ... }`, sin `any`.
- Componentes funcionales con hooks; nada de clases.
- Un átomo no debe importar de moléculas/organismos (jerarquía estricta hacia abajo).

## 5. PWA y responsive

- Usar `vite-plugin-pwa` para manifest + service worker (estrategia `autoUpdate`).
- `manifest.webmanifest` con iconos en varios tamaños (192, 512, maskable), `theme_color` y
  `background_color` acordes al diseño de referencia.
- Mobile-first: escribir estilos base para mobile y usar `min-width` media queries para escalar
  hacia arriba, no al revés.
- Breakpoints centralizados (ej. `src/shared/constants/breakpoints.ts` o variables CSS en
  `:root`), nunca números mágicos repetidos por archivo.
- Layout con Flexbox/Grid, unidades relativas (`rem`, `%`, `clamp()`), imágenes con
  `max-width: 100%`.
- Probar que la app sea instalable y funcione razonablemente offline (al menos shell cacheado)
  antes de dar por cerrada una tarea de PWA.

## 6. Supabase

- Un único cliente (`infrastructure/supabase/client.ts`), inicializado con variables de entorno
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Nunca hardcodear keys.
- `.env.local` fuera de git (verificar que esté en `.gitignore`); documentar variables requeridas
  en `.env.example`.
- Todo acceso a datos pasa por repositorios en `infrastructure/supabase/repositories/`, que
  implementan las interfaces definidas en `domain/repositories/`. La UI y los casos de uso nunca
  importan `@supabase/supabase-js` directamente.
- Regenerar tipos con `supabase gen types typescript` cuando cambie el esquema; no tipar a mano
  las tablas.
- Asumir Row Level Security (RLS) activo en todas las tablas; no depender de la anon key para
  autorización.

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
