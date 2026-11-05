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

El servidor local usa el entorno de pruebas y conecta con
`http://localhost:5082/api`. La compilación de producción reemplaza
automáticamente el entorno de pruebas por `src/environments/environment.prod.ts`.

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
| `npm run version:patch` | Crea una release de corrección (`PATCH`) |
| `npm run version:minor` | Crea una release compatible (`MINOR`) |
| `npm run version:major` | Crea una release incompatible (`MAJOR`) |

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
`GitHub Actions` como fuente de despliegue. El despliegue conserva las rutas
limpias de Angular: genera un `404.html` basado en `index.html` para que
GitHub Pages entregue la aplicación cuando se abre o recarga directamente una
ruta como `/categories` o `/login`.

Para una release, los scripts `version:*` ejecutan `scripts/release.sh`. El
proceso exige un worktree limpio, ejecuta `npm run validate`, incrementa la
versión SemVer en `package.json` y `package-lock.json`, y crea el commit y tag
correspondientes:

```bash
npm run version:patch
git push origin HEAD --follow-tags
```

También se puede usar directamente `bash scripts/release.sh minor` o
`bash scripts/release.sh major`. La opción `--no-validate` está disponible para
casos excepcionales: `bash scripts/release.sh patch --no-validate`.

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
