import type { Config } from "jest";
import nextJest from "next/jest.js";

/**
 * WHAT: Jest config wrapped by next/jest's SWC transformer.
 * WHY:  next/jest reuses Next's own SWC pipeline so tests fail the same
 *       way the build fails. Resolves App Router aliases out of the box.
 *       NOT ts-jest — adds 5+s startup and conflicts with App Router resolution.
 * IF REMOVED: tests can't import from `@/...`, can't parse JSX, can't
 *       handle ESM modules Next ships with.
 * COMMON MISTAKE: forgetting modulePathIgnorePatterns for `.next/` —
 *       jest then resolves modules from the build output, producing
 *       duplicate React contexts and a flood of cryptic errors.
 */
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  testMatch: ["<rootDir>/tests/**/*.test.{ts,tsx}"],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};

export default createJestConfig(config);
