import type { Config } from 'jest';

const baseProject = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  clearMocks: true
};

const config: Config = {
  projects: [
    {
      ...baseProject,
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts']
    },
    {
      ...baseProject,
      displayName: 'api',
      testMatch: ['<rootDir>/tests/api/**/*.test.ts']
    }
  ]
};

export default config;
