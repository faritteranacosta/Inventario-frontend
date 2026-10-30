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

## Flujo de ramas y automatización

`main` es la rama principal y protegida. Cada funcionalidad se desarrolla en
una rama `feat/*` y se integra mediante pull request.

Los hooks de Husky protegen el flujo local:

- `pre-commit` ejecuta `lint-staged` sobre los archivos preparados.
- `commit-msg` valida Conventional Commits.
- `pre-push` ejecuta `npm run validate`.

GitHub Actions ejecuta CI en cada pull request hacia `main` con instalación
reproducible (`npm ci`), lint, formato, pruebas y build. Después de integrar un
pull request en `main`, el mismo workflow construye la aplicación y la publica
en GitHub Pages. En los ajustes del repositorio debe habilitarse Pages con
`GitHub Actions` como fuente de despliegue.

Para una release, `scripts/release.sh` valida el proyecto, incrementa la versión
SemVer y crea el commit y tag correspondiente:

```bash
bash scripts/release.sh patch
git push origin main --follow-tags
```

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
