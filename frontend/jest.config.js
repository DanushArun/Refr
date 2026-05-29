// Pure-logic test runner.
//
// Tests live alongside the code they cover (src/<path>/<name>.test.ts).
// For React-Native/component tests, a separate jest-expo preset would be added.
// This config is intentionally narrow — fast, no native deps, runs anywhere.

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/\\.expo/', '/packages/'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react', esModuleInterop: true } }],
  },
};
