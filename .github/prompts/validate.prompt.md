---
description: Ejecuta lint, formato y pruebas, y corrige fallos relacionados con la tarea.
agent: agent
---

Lee [AGENTS.md](../../AGENTS.md) y sigue
[pre-commit-check](../../.claude/skills/pre-commit-check/SKILL.md).
Ejecuta `npm run validate`, corrige fallos relacionados con los cambios solicitados
y vuelve a ejecutar las comprobaciones afectadas. Limita autofixes y formato a
los archivos tocados; informa los fallos preexistentes sin ampliar el alcance.
Reporta lint, formato y pruebas por separado, incluyendo lo que no pudo ejecutarse.
No crees un commit ni hagas push.
