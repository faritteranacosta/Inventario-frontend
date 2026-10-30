# CLAUDE.md — Plantilla Angular para Inventario SaaS

Guía de trabajo para asistentes de IA en este proyecto.

## Stack y principios

- Angular 21 con componentes standalone, `OnPush`, signals y control flow moderno.
- TypeScript estricto; no usar `any`.
- Tailwind CSS 3 y tokens visuales propios `--app-*`.
- Jest para pruebas, ESLint para calidad y Prettier para formato.
- Componentes nuevos con `.ts`, `.html`, `.scss` y `.spec.ts`.
- La lógica de negocio y acceso a datos vive en servicios.
- Usa `inject()`, `input()` y `output()` en lugar de patrones heredados.

## Estructura

```
src/app/
├── core/          # servicios singleton, guards e interceptores
├── shared/        # UI reutilizable sin lógica de dominio
├── features/      # dominios con pages, components, services y models
└── layout/        # shell, navegación y estructura de la aplicación
```

## UI y accesibilidad

- Usa los tokens `--app-*` definidos en `src/styles/` o las clases Tailwind del proyecto.
- La paleta base combina índigo y cian; los productos pueden extenderla con nuevos tokens.
- Mantén foco visible, labels asociados, texto alternativo y contraste suficiente.
- Prefiere componentes reutilizables y estilos encapsulados.
- No acoples nuevas funcionalidades a una marca, institución o librería visual concreta.

## Validación

Antes de entregar cambios ejecuta:

```bash
npm run validate
```

Formatea solo los archivos modificados y conserva cambios ajenos. No hagas commits ni
push salvo petición explícita.
