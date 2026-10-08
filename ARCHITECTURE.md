---
architecture_md: 1
component: bpmn-io/bpmn-js-properties-panel
lifecycle: production
kind: [ui-library, library]
summary: "The bpmn-js properties panel: the propertiesPanel service, its provider extension point, and the BPMN 2.0, Camunda 8 (zeebe) and Camunda 7 (camunda) property groups, entries and tooltips that edit invisible BPMN properties."
team: { name: bpmn.io team, contact: unknown }
intake: { how: issue }
owns:
  - "The propertiesPanel service in bpmn-js (BpmnPropertiesPanelRenderer): attach/detach, separate header container, layout, FEEL language context and the provider registry with its priority order"
  - "The properties provider contract: getGroups(element) returning a groups updater, optional getEntryId(element, path), registerProvider(priority, provider)"
  - "Which groups and entries the panel shows for each BPMN element type, and how each entry reads and writes the model, for BPMN 2.0 (src/provider/bpmn), Camunda 8 zeebe: extensions (src/provider/zeebe) and Camunda 7 camunda: extensions (src/provider/camunda-platform)"
  - "Group and entry IDs, and the mapping from a moddle property path to an entry ID (propertiesPanel#getEntryId, */utils/EntryIdUtil.js)"
  - "Tooltip texts and documentation links for Camunda 8 and Camunda 7 entries (ZeebeTooltipProvider, CamundaPlatformTooltipProvider)"
  - "The BPMN panel header (element icon, type label, name, template name and icon when one is applied) and the empty / multi-selection placeholders"
  - "The propertiesPanel.* lifecycle events the panel fires (attach, detach, rendered, updated, layoutChanged, providersChanged, descriptionLoaded, tooltipLoaded, destroyed)"
  - "The properties-panel.multi-command-executor command that applies several model changes as one undoable step"
  - "BPMN-specific entry components and HOCs (BpmnFeelEntry, BpmnFeelNumberEntry, ReferenceSelect, withVariableContext, withTooltipContainer, withProps)"
  - "The UX rules for BPMN properties editing in docs/DESIGN.md (section names, edited indicator, global open state, tooltips over descriptions, the = rule for FEEL)"
  - "The npm package bpmn-js-properties-panel: its exports, semver releases and CHANGELOG"
does_not_own:
  - { concept: "Panel framework: Group/ListGroup, entry components, FEEL editor and popup, debounce, showEntry/setDiagnostics handling, panel CSS", owner: bpmn-io/properties-panel }
  - { concept: "Definition of the zeebe: namespace (types, attributes, where they may appear)", owner: camunda/zeebe-bpmn-moddle }
  - { concept: "Definition of the Camunda 7 camunda: namespace", owner: camunda/camunda-bpmn-moddle }
  - { concept: "Keeping zeebe:/camunda: extensions consistent on modeling operations (behaviors)", owner: camunda/camunda-bpmn-js-behaviors }
  - { concept: "Element templates: applying templates, template-driven groups and entries, template validation", owner: bpmn-io/bpmn-js-element-templates }
  - { concept: "Which variables exist in a process (variable suggestions in FEEL entries)", owner: bpmn-io/variable-resolver }
  - { concept: "Lint rules and which entry a lint error points at", owner: camunda/linting }
  - { concept: "Pre-configured Camunda 7 / Camunda 8 modeler distributions that bundle the panel", owner: camunda/camunda-bpmn-js }
  - { concept: "BPMN modeling, moddle import/export, command stack and selection", owner: bpmn-io/bpmn-js }
  - { concept: "Which zeebe: elements and attributes the engine accepts", owner: camunda/camunda/zeebe/bpmn-model }
depends_on:
  - id: properties-panel
    component: bpmn-io/properties-panel
    kind: ui-library
    contract: "@bpmn-io/properties-panel (peer >= 3.42.0, dev ^3.56.0): PropertiesPanel, Header, Group/ListGroup and entry components, FeelLanguageContext, DebounceInputModule, FeelPopupModule, bundled preact (render, hooks, compat)"
    versions: "Peer range in package.json; CI runs an integration job against @bpmn-io/properties-panel@3 (continue-on-error); Renovate raises the dev version"
    workaround_policy: never
  - id: bpmn-js
    component: bpmn-io/bpmn-js
    kind: library
    contract: "bpmn-js (peer >= 11.5, dev ^18.29.1): ModelUtil, ModelingUtil, DiUtil, LabelUtil; services bpmnFactory, modeling, moddle, translate; import.done and root.added events"
    versions: "Peer range in package.json; CI integration job with bpmn-js@11.5 (continue-on-error)"
    workaround_policy: never
  - id: diagram-js
    component: bpmn-io/diagram-js
    kind: library
    contract: "diagram-js (peer >= 11.9, dev ^15.26.0): injector, EventBus, commandStack, canvas, elementRegistry, selection.changed / elements.changed, KeyboardUtil, Collections"
    versions: "Peer range in package.json; CI integration job with diagram-js@11.9 (continue-on-error)"
    workaround_policy: never
  - id: camunda-bpmn-js-behaviors
    component: camunda/camunda-bpmn-js-behaviors
    kind: library
    contract: "camunda-bpmn-js-behaviors (peer >= 0.4, dev ^1.18.0): loaded by the host next to the zeebe / camunda providers so extension elements stay consistent; src does not import it"
    versions: "Peer range in package.json"
    workaround_policy: never
  - id: zeebe-bpmn-moddle
    component: camunda/zeebe-bpmn-moddle
    kind: schema
    contract: "zeebe: types and attributes read and written by name in src/provider/zeebe; the host registers zeebe.json as a moddle extension"
    architecture: ARCHITECTURE.md
    versions: "devDependency ^2.0.0 only (tests); not a peer, the host brings it"
    workaround_policy: never
  - id: camunda-bpmn-moddle
    component: camunda/camunda-bpmn-moddle
    kind: schema
    contract: "camunda: types and attributes read and written by name in src/provider/camunda-platform; the host registers the descriptor"
    versions: "devDependency ^8.0.0 only (tests); not a peer, the host brings it"
    workaround_policy: never
  - id: extract-process-variables
    component: bpmn-io/extract-process-variables
    kind: library
    contract: "@bpmn-io/extract-process-variables ^2.2.1 (dependency): Camunda 7 process variables group; zeebe variable fallback in withVariableContext"
    versions: "Caret range in dependencies; Renovate updates"
    workaround_policy: never
  - id: variable-resolver
    component: bpmn-io/variable-resolver
    kind: library
    contract: "Optional variableResolver service (getVariablesForElement) used by withVariableContext when the host loads it; devDependency ^3.3.0 for tests"
    versions: "Not declared as dependency or peer; used only if present"
    workaround_policy: never
  - id: element-templates
    component: bpmn-io/bpmn-js-element-templates
    kind: library
    contract: "Optional elementTemplates service (get) and elementTemplates.changed event, config.elementTemplateIconRenderer; read by the panel header when the host loads them"
    versions: "Not declared as dependency or peer; used only if present (that package peer-depends on this one)"
    workaround_policy: never
  - id: primitives
    component: "bpmn-io/min-dash, bpmn-io/min-dom, bpmn-io/ids, array-move"
    kind: library
    contract: "min-dash ^5.0.0, min-dom ^5.3.0, ids ^3.0.2, array-move ^4.0.0 (dependencies)"
    versions: "Caret ranges; Renovate updates"
    workaround_policy: never
  - id: bpmn-io-tooling
    component: bpmn-io/actions
    kind: platform
    contract: "bpmn-io/actions setup and pull-request-quality (pinned SHA) in CI.yml and PR.yml, bpmn-io/renovate-config:recommended, eslint-plugin-bpmn-io"
    versions: "Action setup@latest; pull-request-quality pinned by SHA; others by Renovate"
    workaround_policy: never
consumers:
  - { who: camunda/camunda-modeler, via: "client dependency ^5.65.1 (Desktop Modeler); also through camunda-bpmn-js", promise: semver }
  - { who: camunda/camunda-bpmn-js, via: "peer >= 3.0.0 (dev ^5.65.1); composes the panel into the Camunda 7 and Camunda 8 modeler distributions", promise: semver }
  - { who: "camunda/camunda-hub (Web Modeler)", via: "through camunda-bpmn-js (not verified: private repo)", promise: semver }
  - { who: bpmn-io/bpmn-js-element-templates, via: "peer >= 2 (dev ^5.65.0); registers template properties providers, imports useService, copies the unexported HOCs, reads group and entry IDs", promise: semver }
  - { who: camunda/linting, via: "peer >= 2.0.0 (dev ^5.65.1); propertiesPanel#getEntryId and entry IDs to point lint errors at entries", promise: semver }
  - { who: camunda/example-data-properties-provider, via: "peer >= 1; registers its own properties provider", promise: semver }
  - { who: bpmn-io/variable-resolver, via: "devDependency ^5.60.0 (tests only)", promise: semver }
  - { who: "bpmn-io/bpmn-js-examples (properties-panel example)", via: "package entry points; integration test in the release checklist", promise: semver }
  - { who: "Embedders of bpmn-js on npm", via: "package entry points, propertiesPanel config and API, custom properties providers", promise: "semver; breaking changes only in a major, under Breaking Changes in CHANGELOG.md" }
exposes:
  - { contract: "Package entry points: BpmnPropertiesPanelModule, BpmnPropertiesProviderModule, ZeebePropertiesProviderModule, CamundaPlatformPropertiesProviderModule, ZeebeTooltipProvider, CamundaPlatformTooltipProvider, useService", spec: src/index.js, policy: "semver; only dist/ is published (CJS, ESM, UMD), so nothing else is importable" }
  - { contract: "propertiesPanel service API: attachTo(container, headerContainer?), detach(), registerProvider(priority, provider), setLayout(layout), setFeelLanguageContext(context), getEntryId(element, path)", spec: README.md, policy: semver }
  - { contract: "Extension point: properties providers", spec: "README.md#bpmnpropertiespanelrendererregisterproviderpriority-number-provider-propertiesprovider--void", policy: "a provider registered with a priority (default 1000; built-in Camunda providers 500) gets the groups of every provider that ran before it and may add, change, wrap, reorder or remove them; lower priority runs later; optional getEntryId is asked in reverse render order" }
  - { contract: "Extension point: config.propertiesPanel options (parent, layout, description, tooltip, feelPopupContainer, getFeelPopupLinks, feelLanguageContext)", spec: src/render/BpmnPropertiesPanelRenderer.js, policy: semver }
  - { contract: "Extension point: optional services the panel uses when present (variableResolver, elementTemplates, config.elementTemplateIconRenderer)", spec: src/provider/HOCs/withVariableContext.js, policy: "undocumented; a host can replace variable resolution by providing variableResolver" }
  - { contract: "Events: propertiesPanel.attach, detach, rendered, updated, layoutChanged, providersChanged, getProviders, descriptionLoaded, tooltipLoaded, destroyed (fired); propertiesPanel.setLayout (handled)", spec: src/render, policy: "semver (not listed in README; used by hosts and extensions)" }
  - { contract: "Group and entry IDs (for example timerEventDefinitionValue, ServiceTask_1-input-1-source)", spec: src/provider/zeebe/utils/EntryIdUtil.js, policy: "removing or renaming an ID was released as breaking (2.0.0)" }
  - { contract: "Command properties-panel.multi-command-executor", spec: src/cmd/MultiCommandHandler.js, policy: "undocumented; registered on diagram.init and used by most entries in src" }
constraints:
  - { id: C1, name: Public API and provider contract stay backward compatible, hard: true, ref: CHANGELOG.md }
  - { id: C2, name: Group and entry IDs stay stable, hard: true, ref: src/provider/zeebe/utils/EntryIdUtil.js }
  - { id: C3, name: Model changes land upstream first, hard: true, ref: docs/RELEASE_CHECKLIST.md }
  - { id: C4, name: Right provider for the right platform, hard: false, ref: src/index.js }
  - { id: C5, name: Every edit is one undoable command, hard: true, ref: src/cmd/MultiCommandHandler.js }
  - { id: C6, name: UX follows DESIGN.md, hard: false, ref: docs/DESIGN.md }
  - { id: C7, name: Oldest supported peers still work, hard: false, ref: .github/workflows/CI.yml }
  - { id: C8, name: Accessible and translatable entries, hard: false, ref: test/TestHelper.js }
  - { id: C9, name: Tests and bpmn.io contribution rules, hard: true, ref: .github/CONTRIBUTING.md }
---

# Architecture — bpmn-io/bpmn-js-properties-panel

> Draft from the repository; not reviewed by its team. Facts marked `TODO(confirm)` are inferred.

## 1. Purpose

A [bpmn-js](https://github.com/bpmn-io/bpmn-js) extension that lets users edit the BPMN properties
the diagram does not show: generic BPMN 2.0 ones and the execution properties of Camunda 8 and
Camunda 7 ([README](README.md)). Its users are the Camunda modelers (Desktop Modeler directly, Web
Modeler through `camunda-bpmn-js`), the bpmn.io extensions that add their own groups, and anyone
embedding bpmn-js. No `SYSTEM.md` describes its system yet; the
[bpmn.io ecosystem map](https://github.com/bpmn-io/ecosystem/blob/main/MAP.md) places it in
Layer 5, properties panels, between `@bpmn-io/properties-panel` and the modeler applications.

## 2. Ownership boundary

**Owns:** the `propertiesPanel` service, the provider contract, every built-in group and entry for
BPMN, Camunda 8 and Camunda 7, their IDs and tooltips, the header and placeholders, and the BPMN
UX rules in [docs/DESIGN.md](docs/DESIGN.md). The full list is in the front matter.

Owner: there is no CODEOWNERS file (locally or on the default branch). CONTRIBUTING signs off as
"the bpmn.io team"; the most frequent recent committers are Nico Rehwaldt (package author), Maciej
Barelkowski, Jarek Danielak and Aleksey Manetov. TODO(confirm): the owning GitHub team, a
CODEOWNERS file, and a contact channel.

Boundaries that moved, from the CHANGELOG:
- 3.0.0: element templates moved out to `bpmn-io/bpmn-js-element-templates`.
- 4.0.0: descriptions with documentation links became tooltips (`ZeebeTooltipProvider`).
- 5.0.0: the panel stylesheet is no longer published here; it comes from `@bpmn-io/properties-panel`.

Read from code and manifests, not confirmed:
- TODO(confirm): the panel header still reads the optional `elementTemplates` service and listens
  to `elementTemplates.changed`, so template name, icon and documentation in the header are owned
  here even though templates are not.
- TODO(confirm): `camunda-bpmn-js-behaviors` is a peer dependency although `src/` never imports it;
  is the peer meant as "always load behaviors with the Camunda providers" (README § Edit Camunda
  Properties)?
- TODO(confirm): Web Modeler (`camunda/camunda-hub`) gets the panel only through `camunda-bpmn-js`.
- TODO(confirm): the `propertiesPanel.*` events and `properties-panel.multi-command-executor` are
  public contracts others may rely on, though the README does not list them.

**Does not own (route here instead):**

| If you need… | It belongs to | How to ask |
|---|---|---|
| A new entry component, FEEL editor behaviour, panel styling, `showEntry` / diagnostics display | `bpmn-io/properties-panel` | issue in that repo |
| A new `zeebe:` element or attribute in the model | `camunda/zeebe-bpmn-moddle` (engine side: `camunda/camunda/zeebe/bpmn-model`) | issue in that repo |
| A new `camunda:` (Camunda 7) element or attribute | `camunda/camunda-bpmn-moddle` | issue in that repo |
| Extensions created, kept consistent or cleaned up when the model changes | `camunda/camunda-bpmn-js-behaviors` | issue in that repo |
| Groups and entries driven by an element template | `bpmn-io/bpmn-js-element-templates` | issue in that repo |
| Variable suggestions in FEEL fields | `bpmn-io/variable-resolver` | issue in that repo |
| A lint error, or where it points in the panel | `camunda/linting`, `camunda/bpmnlint-plugin-camunda-compat` | issue in that repo |
| A Camunda modeler distribution that includes the panel | `camunda/camunda-bpmn-js` | issue in that repo |
| User documentation the tooltips link to | `camunda/camunda-docs` | TODO(confirm) |

## 3. Structure

| Path | Contents |
|---|---|
| `src/index.js` | Public entry points (the only importable surface; `files: ["dist"]`) |
| `src/render/` | `BpmnPropertiesPanelRenderer` (the `propertiesPanel` service), `BpmnPropertiesPanel` (preact root, selection and update handling), header and placeholder providers |
| `src/cmd/` | `properties-panel.multi-command-executor` |
| `src/provider/bpmn/` | BPMN 2.0 provider (priority 1000): general, documentation, events, multi-instance, ... |
| `src/provider/zeebe/` | Camunda 8 provider (priority 500): adds zeebe groups and updates/removes BPMN groups |
| `src/provider/camunda-platform/` | Camunda 7 provider (priority 500), same pattern |
| `src/provider/shared/`, `src/provider/HOCs/` | Code used by both Camunda providers; entry HOCs |
| `src/contextProvider/{zeebe,camunda-platform}/` | Tooltip texts per platform |
| `src/entries/`, `src/hooks/`, `src/context/`, `src/utils/` | BPMN entry components, `useService`, panel context, model helpers |

Dependency direction: `render` knows no provider; providers depend on `render` only through
`propertiesPanel.registerProvider`. The Camunda providers build on the BPMN provider's groups by ID
(they run after it) and must not import each other. Variant-specific code goes in the matching
provider folder; a feature for both Camunda 7 and 8 is written twice or placed in `provider/shared`.
TODO(confirm): whether the "no cross-import between zeebe and camunda-platform" rule is intended;
it is what the code does today.

## 4. Binding decisions

No ADR index. The decisions that shape features most often, from README, DESIGN.md and CHANGELOG:

- Everything is a bpmn-js module wired by `didi`; features are added as providers, not by editing
  the renderer (README § API).
- Providers compose by priority: a later provider receives and may rewrite earlier groups.
- UX principles in [docs/DESIGN.md](docs/DESIGN.md), rooted in the
  [bpmn.io design principles](https://github.com/bpmn-io/design-principles): `=` marks FEEL, section
  open state is global, tooltips rather than descriptions, edited indicator per section.
- Element templates live in their own package (3.0.0); the panel framework and its CSS live in
  `@bpmn-io/properties-panel` (5.0.0).
- Entry IDs are a public contract (2.0.0 Breaking Changes; `getEntryId` in 5.63.0).

## 5. Planning constraints

Every plan must answer each of these (applies / n/a + decision or reason).

### C1 — Public API and provider contract stay backward compatible
- **Question:** Does the change alter an exported module, a `propertiesPanel` method, a config
  option, the provider contract (`getGroups`, `getEntryId`, priorities) or a fired event? Then it is
  a major with a Breaking Changes entry. Do existing custom providers still work unchanged?
- **Hard:** yes
- **Detail:** [CHANGELOG.md](CHANGELOG.md) (semantic versioning, Breaking Changes sections).

### C2 — Group and entry IDs stay stable
- **Question:** Does the change rename, remove or re-nest a group or entry ID, or change what
  `getEntryId` returns for a path? Who reads that ID today (element templates, `camunda/linting`,
  custom providers)? Is the new entry reachable from `getEntryId` for its moddle path?
- **Hard:** yes (TODO(confirm): inferred from 2.0.0 and consumers)
- **Detail:** `src/provider/*/utils/EntryIdUtil.js`, `test/spec/provider/bpmn/EntryIdUtil.spec.js`.

### C3 — Model changes land upstream first
- **Question:** Does the feature need a new `zeebe:` / `camunda:` type or attribute, or a new
  behavior? Are `zeebe-bpmn-moddle`, `camunda-bpmn-moddle`, `camunda-bpmn-js-behaviors`, `bpmn-js`
  or `@bpmn-io/properties-panel` released with it, and in which order?
- **Hard:** yes
- **Detail:** [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) ("make sure changes in upstream
  libraries are merged and released").

### C4 — Right provider for the right platform
- **Question:** Is this generic BPMN (`provider/bpmn`), Camunda 8 (`provider/zeebe`), Camunda 7
  (`provider/camunda-platform`) or both? Does it need a tooltip in the matching tooltip provider?
- **Hard:** no
- **Detail:** [src/index.js](src/index.js), README § Edit Camunda Properties.

### C5 — Every edit is one undoable command
- **Question:** Does every user edit go through `commandStack` / `modeling` as a single step (using
  `properties-panel.multi-command-executor` when it touches several objects), so undo and redo work?
- **Hard:** yes
- **Detail:** [src/cmd/MultiCommandHandler.js](src/cmd/MultiCommandHandler.js), README § Features.

### C6 — UX follows DESIGN.md
- **Question:** Does the new section or entry have a semantic name, a tooltip with a docs link
  rather than a description, an edited indicator where it deviates from defaults, and the `=` FEEL
  rule if it accepts expressions?
- **Hard:** no (TODO(confirm))
- **Detail:** [docs/DESIGN.md](docs/DESIGN.md).

### C7 — Oldest supported peers still work
- **Question:** Does the change use an API newer than the peer ranges (`bpmn-js >= 11.5`,
  `diagram-js >= 11.9`, `@bpmn-io/properties-panel >= 3.42.0`, `camunda-bpmn-js-behaviors >= 0.4`)?
  Then raise the peer range (a `DEPS` entry; TODO(confirm) whether raising a peer is breaking).
- **Hard:** no (the CI integration jobs are `continue-on-error`)
- **Detail:** [.github/workflows/CI.yml](.github/workflows/CI.yml), [package.json](package.json).

### C8 — Accessible and translatable entries
- **Question:** Are all labels, descriptions and tooltips passed through `translate`? Do the a11y
  specs in `test/spec/BpmnPropertiesPanelRenderer.spec.js` (`expectNoViolations` on
  `test/fixtures/a11y-c7.bpmn`, `a11y-c8.bpmn`) still pass, and do the fixtures cover the new
  entries?
- **Hard:** no (TODO(confirm))
- **Detail:** [test/TestHelper.js](test/TestHelper.js).

### C9 — Tests and bpmn.io contribution rules
- **Question:** Is there a spec and `.bpmn` fixture per changed `*Props.js`? Does `npm run all`
  (lint, karma tests, build, distro test) pass? Single commit, conventional commit message, PR
  quality check green?
- **Hard:** yes
- **Detail:** [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md), [PR.yml](.github/workflows/PR.yml).

## 6. Data and persistence

No store. Everything the panel edits ends up in the user's `.bpmn` file through bpmn-js; what
reaches the engine is defined by the moddle packages (C3). Panel UI state (open sections, layout)
lives in memory and is handed to the host via `propertiesPanel.layoutChanged`; persisting it is the
host's job (TODO(confirm)).

## 7. Cross-cutting qualities

- **Accessibility:** axe-core checks in the test suite (C8).
- **i18n:** all strings through the diagram-js `translate` service; translations are not in this
  repo (TODO(confirm): `bpmn-io/bpmn-js-i18n` or each host).
- **Security:** tooltips are static JSX from this repo; the header links to a template's
  documentation URL taken from the element template (TODO(confirm): whether that URL is validated
  here or in `bpmn-js-element-templates`).
- **Performance:** groups are recomputed per selection and on `elements.changed`; multi-selection
  shows no groups.
- **Browser support:** CI runs ChromeHeadless only. TODO(confirm): the supported browser matrix.

## 8. Delivery

Released to npm as `bpmn-js-properties-panel` following the
[release checklist](docs/RELEASE_CHECKLIST.md): upstream released first, CHANGELOG updated,
integration test in the bpmn-js-examples properties-panel example, then semantic release.
Consumers (camunda-bpmn-js, Desktop Modeler, element templates, linting) pick it up through
Renovate. A 6.0.x pre-release line was backported into 5.51.0 and 5.x continues; TODO(confirm):
the status of the 6.x line and whether backports are expected.

## 9. Testing expectations

- `npm run all`: ESLint, Karma + Mocha in ChromeHeadless (`test/spec/**`), Rollup build, distro test.
- One spec and `.bpmn` fixture per Props module under `test/spec/provider/<bpmn|zeebe|camunda-platform>`.
- CI: Node 24, coverage to Codecov (must upload), plus integration jobs on the oldest peers (C7).
- `npm start` (`start:cloud`, `start:platform`, `start:bpmn`) opens a single modeler for manual checks.

## 10. Planning conventions

- Issues and PRs in `bpmn-io/bpmn-js-properties-panel`; one legacy template
  (`.github/ISSUE_TEMPLATE.md`), no labels defined in the repo.
- CHANGELOG entries prefixed `FEAT`, `FIX`, `CHORE`, `DEPS` with the PR link.
- TODO(confirm): plans directory, ID prefix for plan refs, and whether cross-repo requests should
  carry a label.

## 11. Glossary

- **Properties provider:** an object with `getGroups(element)` registered on `propertiesPanel`; not
  the same as a moddle extension, which only teaches bpmn-js the XML.
- **Group / entry:** a collapsible section and a single field in it; both have stable IDs.
- **Zeebe / camunda-platform:** folder and module names for Camunda 8 and Camunda 7.
- **Tooltip provider:** a map from group/entry ID (`group-assignmentDefinition`, ...) to a component
  rendering translated help text with a docs link, set via `config.propertiesPanel.tooltip`.
- **`@bpmn-io/properties-panel` vs `bpmn-js-properties-panel`:** the generic panel framework vs this
  BPMN integration of it.
- **Behaviors:** `camunda-bpmn-js-behaviors` modules that keep extensions consistent while editing;
  the panel relies on them but does not contain them.
