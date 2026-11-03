#!/usr/bin/env bash
# ============================================================================
#  Release de la plantilla Inventario SaaS
#  Sube la versión (SemVer), valida, comitea el bump y crea el tag.
#
#  Uso:
#    bash scripts/release.sh <patch|minor|major|X.Y.Z> [--no-validate]
#
#    patch → correcciones            (0.1.0 → 0.1.1)
#    minor → nuevas funciones        (0.1.0 → 0.2.0)
#    major → cambios incompatibles   (0.1.0 → 1.0.0)
#
#    --no-validate  omite `npm run validate` (lint + formato + pruebas)
#
#  Nota: comitea PRIMERO tus cambios de código (con Conventional Commits);
#  este script solo agrega el commit del cambio de versión.
# ============================================================================
set -euo pipefail

BUMP="${1:-}"
FLAG="${2:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "$BUMP" ]; then
  echo "Uso: bash scripts/release.sh <patch|minor|major|X.Y.Z> [--no-validate]"
  exit 1
fi

if [[ ! "$BUMP" =~ ^(patch|minor|major|[0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
  echo "Versión inválida: usa patch, minor, major o X.Y.Z."
  exit 2
fi

# No liberar con cambios sin commitear (commitea tu trabajo antes del bump).
if [ -n "$(git -C "$ROOT" status --porcelain)" ]; then
  echo "❌ Hay cambios sin commitear. Comitéalos antes de liberar:"
  git -C "$ROOT" status --short
  exit 1
fi

# Validación de calidad (salvo --no-validate)
if [ "$FLAG" != "--no-validate" ]; then
  echo "→ Ejecutando validación (lint + formato + pruebas)…"
  (cd "$ROOT" && npm run validate)
fi

# Sube la versión en el package.json raíz
NEW_VERSION="$(cd "$ROOT" && npm version "$BUMP" --no-git-tag-version | tail -1)"
NEW_VERSION="${NEW_VERSION#v}"
echo "→ Nueva versión: $NEW_VERSION"

# Commit + annotated tag
git -C "$ROOT" add package.json package-lock.json
git -C "$ROOT" commit \
  -m "chore(release): v$NEW_VERSION" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git -C "$ROOT" tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
echo "✓ Commit y tag v$NEW_VERSION creados."
echo ""
echo "Siguiente:  git push && git push --tags"
