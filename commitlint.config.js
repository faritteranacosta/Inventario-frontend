/**
 * Convención de commits (Conventional Commits) para el proyecto.
 * Ejemplos válidos:
 *   feat(colaboradores): agrega listado paginado
 *   fix(auth): corrige expiración de token
 *   docs(readme): actualiza guía de instalación
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'header-max-length': [2, 'always', 100],
  },
};
