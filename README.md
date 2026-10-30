# Inventario SaaS — Angular Frontend

Plantilla limpia para construir el frontend de una aplicación SaaS de inventario.
Incluye Angular 21, Tailwind CSS, Jest, ESLint, Prettier y una base de tokens
visuales vibrantes e independientes.

## Puesta en marcha

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200`.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Pruebas unitarias en modo watch |
| `npm run test:ci` | Pruebas unitarias deterministas |
| `npm run lint` | ESLint |
| `npm run format:check` | Verificación de formato |
| `npm run validate` | Lint, formato y pruebas |

## Estructura

```text
src/app/
├── core/          # servicios singleton, guards e interceptores
├── shared/        # componentes y utilidades reutilizables
├── features/      # dominios funcionales
└── layout/        # shell y navegación

src/styles/        # tokens de color y tipografía --app-*
.claude/           # instrucciones, skills y comandos para asistentes
.github/           # instrucciones y perfiles de Copilot
```

## Convenciones

- Componentes standalone con `OnPush`, signals y control flow moderno.
- Tipos estrictos y lógica de negocio en servicios.
- Componentes con `.ts`, `.html`, `.scss` y `.spec.ts`.
- Tokens `--app-*` o clases Tailwind para colores, tipografía y espaciado.
- Accesibilidad con labels asociados, foco visible, teclado y texto alternativo.

La pantalla inicial y `/admin` son ejemplos reemplazables para comenzar el
desarrollo del producto.
