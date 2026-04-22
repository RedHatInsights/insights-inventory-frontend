/// <reference types="@testing-library/jest-dom/jest-globals" />

/**
 * `@types/jest` supplies the `jest` namespace (e.g. `jest.Mock`) but not a global
 * `jest` value in Jest 29+, which triggers TS2708. Align the global with `@jest/globals`.
 */
declare const jest: typeof import('@jest/globals').jest;
