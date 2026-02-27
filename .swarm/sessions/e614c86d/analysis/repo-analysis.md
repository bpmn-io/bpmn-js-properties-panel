## Overview
`bpmn-js-properties-panel` is a single-package JavaScript library that adds a configurable properties sidebar to `bpmn-js` modelers so users can edit technical BPMN metadata (core BPMN, Camunda Platform 7, and Zeebe/Camunda 8). It targets application developers embedding BPMN modeling, exposing DI modules/providers and reusable entry components rather than a standalone app. The repo is actively maintained (`5.52.1` in `package.json`, with ongoing changes in `CHANGELOG.md` including unreleased and pre-release `6.x` notes).

## Tech Stack
- **Language:** JavaScript (ES modules + JSX)
- **Runtime target:** Browser (library consumed by `bpmn-js` modelers)
- **UI layer:** Preact via `@bpmn-io/properties-panel/preact` aliasing
- **Host framework:** `bpmn-js` / `diagram-js` dependency-injection + event bus ecosystem
- **Package manager:** npm (`package-lock.json`)
- **Build system:** Rollup (`rollup.config.mjs`) + Babel JSX transform
- **Test framework:** Karma + Mocha + Sinon/Chai; Webpack test bundling; Chrome via Puppeteer
- **A11y testing:** `axe-core` with helper assertion in `test/TestHelper.js`
- **Linting:** ESLint 9 flat config (`eslint.config.mjs`) with `eslint-plugin-bpmn-io`, `react-hooks`, `import`
- **CI/CD:** GitHub Actions (`.github/workflows/CI.yml`) + Codecov upload; CodeQL workflow (`CODE_SCANNING.yml`)

## Repository Structure
- **Type:** Single-package library repository

- **Top 2 levels (key paths):**
  - `.github/`
    - `workflows/` — CI matrix build/test/coverage and CodeQL scanning.
  - `docs/`
    - `RELEASE_CHECKLIST.md` — release process checklist; screenshot asset.
  - `src/` — library source.
    - `cmd/` — command registration and `MultiCommandHandler`.
    - `context/` — Preact context for service access and selected element.
    - `contextProvider/` — tooltip provider maps for Zeebe and Camunda Platform.
    - `entries/` — shared entry components (`BpmnFeelEntry`, `ReferenceSelect`).
    - `hooks/` — DI bridge hooks (`useService`).
    - `icons/` — BPMN/icon assets for header and placeholders.
    - `provider/` — BPMN, Zeebe, Camunda Platform providers + shared/HOCs.
    - `render/` — renderer service, root panel component, header/placeholder providers.
    - `utils/` — moddle/element/validation/event-definition helpers.
    - `index.js` — public exports.
  - `test/` — automated tests.
    - `spec/` — unit/integration specs (provider-heavy, mirrored by domain).
    - `fixtures/` — shared BPMN fixture files.
    - `distro/` — dist smoke test.
    - `TestHelper.js` — bootstrap, DOM helpers, a11y helpers.
    - `testBundle.js` / `coverageBundle.js` — Karma webpack entries.
  - `tasks/`
    - `wiredeps` — helper script for upstream branch dependency wiring.
  - `dist/` — built artifacts published via npm.

- **Entry points and roles:**
  - `src/index.js` — main public API surface (panel module, provider modules, tooltip providers, hook).
  - `src/render/index.js` — DI module exposing `propertiesPanel` renderer service and dependencies.
  - `src/provider/*/index.js` — DI modules that register provider implementations.
  - `rollup.config.mjs` — build entry (`src/index.js`) to UMD/CJS/ESM outputs.
  - `karma.config.js` + `test/testBundle.js` — test runtime entry configuration.

## Architecture
- **High-level component diagram (text):**
  1. Host app creates `bpmn-js` modeler with `BpmnPropertiesPanelModule` (+ optional provider modules).
  2. `BpmnPropertiesPanelRenderer` (DI service) attaches/detaches DOM container and renders the panel.
  3. Providers register through `propertiesPanel.registerProvider(priority, provider)`.
  4. `BpmnPropertiesPanel` reacts to modeler events and composes groups from registered providers.
  5. `@bpmn-io/properties-panel` renders groups/entries and drives field interactions.

- **Key abstractions and patterns:**
  - **diagram-js DI module pattern:** objects with `__init__` and service bindings (`[ 'type', Class ]`).
  - **Provider pipeline:** each provider implements `getGroups(element) => (groups) => groups`; providers are composed by event priority.
  - **Group/Entry composition:** groups are returned conditionally (`null` filtered out), entries define component + edited-state checks.
  - **Event-driven re-rendering:** panel listens to `selection.changed`, `elements.changed`, `import.done`, `propertiesPanel.providersChanged`, `elementTemplates.changed`.
  - **Service access in UI:** `useService` pulls diagram services from `BpmnPropertiesPanelContext`.
  - **Batched mutations:** `properties-panel.multi-command-executor` executes multiple command-stack operations as one undoable step.

- **Data flow (user edit path):**
  1. Selection/import change updates panel state (`selectedElement`).
  2. Panel requests providers via `propertiesPanel.getProviders`.
  3. Providers append/modify/remove groups for the current element.
  4. Entry components read current moddle values and write via `modeling.updateProperties`, `modeling.updateModdleProperties`, or command-stack execute.
  5. Command stack emits changes; panel refreshes on `elements.changed` / `commandStack.changed`-driven effects.

## Key Files Reference

| File path | Purpose | Key exports/interfaces |
|---|---|---|
| `src/index.js` | Public package API | `BpmnPropertiesPanelModule`, `BpmnPropertiesProviderModule`, `ZeebePropertiesProviderModule`, `CamundaPlatformPropertiesProviderModule`, tooltip providers, `useService` |
| `src/render/index.js` | Panel DI module wiring | default module object with `propertiesPanel` service |
| `src/render/BpmnPropertiesPanelRenderer.js` | Renderer service lifecycle and provider registration | `BpmnPropertiesPanelRenderer` (`attachTo`, `detach`, `registerProvider`, `setLayout`) |
| `src/render/BpmnPropertiesPanel.js` | Root panel Preact component | default component; provider composition and event subscriptions |
| `src/provider/bpmn/BpmnPropertiesProvider.js` | Base BPMN group provider | `BpmnPropertiesProvider` |
| `src/provider/zeebe/ZeebePropertiesProvider.js` | Zeebe/Camunda 8 provider + group mutations | `ZeebePropertiesProvider` |
| `src/provider/camunda-platform/CamundaPlatformPropertiesProvider.js` | Camunda 7 provider + group ordering/overrides | `CamundaPlatformPropertiesProvider` |
| `src/cmd/index.js` | Registers custom command handlers | default module initializing `properties-panel.multi-command-executor` |
| `src/cmd/MultiCommandHandler.js` | Multi-command executor handler | `MultiCommandHandler` |
| `src/entries/BpmnFeelEntry.js` | FEEL entry composition wrapper | `BpmnFeelEntry` |
| `src/provider/HOCs/withVariableContext.js` | Injects process variables into FEEL-capable entries | `withVariableContext` |
| `src/provider/shared/ExtensionPropertiesProps.js` | Shared extension-property list add/remove behavior | `ExtensionPropertiesProps` and helpers |
| `test/TestHelper.js` | Test bootstrap and shared assertions/utilities | `bootstrapPropertiesPanel`, `changeInput`, `expectNoViolations`, etc. |
| `karma.config.js` | Browser test runner and webpack test config | Karma configuration function |
| `.github/workflows/CI.yml` | Main CI matrix (default + integration dependency variants) | GitHub Actions workflow |

## Commands

| Command | Description |
|---|---|
| `npm run all` | Full pipeline: lint, test, distro (`run-s lint test distro`) |
| `npm run lint` | ESLint on repository |
| `npm test` | Run Karma test suite once |
| `npm run dev` | Karma in watch mode (`--auto-watch --no-single-run`) |
| `npm run build` | Clean and bundle (`run-p clean bundle`) |
| `npm run clean` | Remove `dist/` |
| `npm run bundle` | Rollup build |
| `npm run bundle:watch` | Rollup watch mode |
| `npm run distro` | Build + dist smoke test |
| `npm run test:build` | Mocha smoke tests in `test/distro` |
| `npm start` | Alias for cloud-focused start mode |
| `npm run start:cloud` | `SINGLE_START=cloud` + dev tests |
| `npm run start:platform` | `SINGLE_START=platform` + dev tests |
| `npm run start:bpmn` | `SINGLE_START=bpmn` + dev tests |
| `npm run prepare` | Build on prepare lifecycle |

## Patterns & Conventions
- **Naming conventions**
  - Provider classes use `*PropertiesProvider`.
  - Property modules are `*Props.js` and typically export `*Props(...)`.
  - UI/service files use PascalCase for component/service files and camelCase for utility hooks.
- **Testing patterns**
  - Provider tests live under `test/spec/provider/<scope>/`.
  - Most features pair `<Feature>.spec.js` with `<Feature>.bpmn` in same folder.
  - Tests bootstrap modeler/panel via `bootstrapPropertiesPanel(...)` and interact via DOM helper utilities.
  - Accessibility checks use `expectNoViolations(...)`.
- **Error handling approach**
  - Validation helpers return translated error strings (e.g., `ValidationUtil.js`).
  - Non-applicable groups/entries return `null`/`[]` and are filtered.
  - Invalid provider contract is surfaced with `console.error` in renderer registration.
- **Documentation conventions**
  - `README.md` for usage/API/dev commands.
  - `CHANGELOG.md` for release history.
  - `docs/RELEASE_CHECKLIST.md` for release procedure.
- **Import/module conventions**
  - ESM imports throughout source.
  - Preact/React imports are intentionally aliased to `@bpmn-io/properties-panel/preact` (Rollup + Karma webpack config).
  - Tests commonly import via absolute-like aliases (`src/...`, `test/...`) enabled by webpack `resolve.modules`.

## How to Implement a New Feature
1. Decide feature scope by provider:
   - Core BPMN: `src/provider/bpmn/`
   - Camunda 8/Zeebe: `src/provider/zeebe/`
   - Camunda 7 Platform: `src/provider/camunda-platform/`
2. Add or extend a property module in that provider’s `properties/` folder using existing `*Props` patterns (entry definitions with `id`, `component`, `isEdited`).
3. Export the new module from the provider’s `properties/index.js`.
4. Wire it into the provider class (`*PropertiesProvider.js`) by adding/updating a group factory or update function.
5. If the feature requires coordinated moddle writes, use command-stack updates and, when needed, batch via `properties-panel.multi-command-executor` (see `MultiCommandHandler` usage in shared/zeebe props).
6. If FEEL variables or tooltips are relevant, reuse `BpmnFeelEntry`, `withVariableContext`, and appropriate tooltip provider maps under `src/contextProvider/...`.
7. Add tests in mirrored location under `test/spec/provider/<scope>/`:
   - fixture BPMN (`*.bpmn`)
   - spec (`*.spec.js`) using `bootstrapPropertiesPanel`, selection, and input helpers.
8. Run validation commands:
   - `npm run lint`
   - `npm test`
   - `npm run distro` (or `npm run all` for full pipeline)

## Dependencies
- `@bpmn-io/extract-process-variables` — extracts variable metadata for process-variable UI and FEEL context (`withVariableContext`, Camunda `ProcessVariablesProps`).
- `array-move` — reorders groups in Camunda Platform provider (`moveGroup` behavior).
- `ids` — generates deterministic prefixed IDs (e.g., Zeebe user task form IDs in `FormUtil`).
- `min-dash` — core utility helpers used across providers, rendering logic, and commands.
- `min-dom` — lightweight DOM utilities for panel attach/query/event binding in runtime UI code.