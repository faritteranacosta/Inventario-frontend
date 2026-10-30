/**
 * Configuración de Jest para pruebas unitarias Angular.
 * Usa jest-preset-angular (compilación con ts-jest y entorno jsdom).
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/out-tsc/'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  // Transpila los paquetes ESM de node_modules que se distribuyen como .mjs.
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  // Cobertura para SonarQube (formato lcov).
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.model.ts',
    '!src/app/**/*.routes.ts',
    '!src/main.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text-summary', 'lcov'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.(html|svg)$' },
    ],
  },
};
