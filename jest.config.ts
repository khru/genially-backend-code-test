
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: [
    "<rootDir>/tests/**/*.ts",
    "<rootDir>/tests/**/*.test.ts",
    "<rootDir>/tests/**/*.spec.ts"
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/api/server.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: "tsconfig.json"
    }]
  },
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  verbose: true,
  testTimeout: 10000
};

export default config;
