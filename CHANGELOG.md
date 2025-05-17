# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **(structured)** Enhanced patch parsing logic with flexible configuration options.
  <details>
  <summary>Details</summary>
  Allows user-defined processing of dates and diff structures. (666eeb5af094f21f049d5ffaa7c08b24b809005d)
  </details>
- **(parse)** Implemented functionality to parse Git diff strings into structured object arrays.
  <details>
  <summary>Details</summary>
  Includes file changes, each hunk, and line types (additions, deletions, context). (2ea4bb4453594b73a05ddb9a804c6a7df6f0da2e)
  </details>

### Changed

- **(parser)** Improved type safety and modularity in parsing logic.
  <details>
  <summary>Details</summary>
  Centralized parsing-related constants, introduced generic types for `ParseOptions` and `ParsedCommit`, and updated `parseGitPatch` to use these enhanced types. (d3a6d9572b5b3986166bb360134499ed49dbe8af)
  </details>
- **(script)** Replaced `rm -rf dist` in build script with a cross-platform Node.js script.
  <details>
  <summary>Details</summary>
  The new script ([`scripts/cleanDist.ts`](scripts/cleanDist.ts:1)) enhances compatibility. (317c061f504bce58d68af66860fbd83161aa824b)
  </details>
- **(parse/patch)** Improved readability and organization of `parseGitPatch` tests.
  <details>
  <summary>Details</summary>
  Moved mock data to a separate file ([`src/mocks/patch.ts`](src/mocks/patch.ts:1)) and updated `tsconfig.json` include paths. (20d72cc2efa8f36750519a15f66470c9a27ed8cf)
  </details>
- **(parser)** Refactored core parsing logic file structure.
  <details>
  <summary>Details</summary>
  Moved core parsing logic files ([`src/logics/parse/patch.ts`](src/logics/parse/patch.ts:1) and [`src/logics/parse/patch.test.ts`](src/logics/parse/patch.test.ts:1)) to `src/logics/parse/`. Created new index files ([`src/index.ts`](src/index.ts:1), [`src/logics/index.ts`](src/logics/index.ts:1)) for re-exporting and added [`src/types.ts`](src/types.ts:1) for type definitions. (40900db843c36adb05f5e4e52f1c197acd186a03)
  </details>

### Style

- **(test)** Adjusted import order in [`src/logics/parse/patch.test.ts`](src/logics/parse/patch.test.ts:1). (4cb8a65b3ac9132794bfc107f1c56fc927355c5b)

## [0.1.4] - 2024-12-19

- Initial state.
