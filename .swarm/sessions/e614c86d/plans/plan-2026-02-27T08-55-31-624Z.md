# Plan

**Timestamp:** 2026-02-27T08:55:31.624Z

## Original Request

# "Cancel" process instance execution listener

Epic: https://github.com/camunda/product-hub/issues/2768

## Value Proposition Statement

Enable system integrators to react programmatically when a process instance is cancelled (termination or operator action), enabling external systems to reflect the cancellation state — releasing locks, sending notifications, or recording audit data automatically.

## User Problem

Currently, Camunda 8 only supports execution listeners for process instance start and end events, leaving a critical gap in handling process cancellations. When processes are cancelled, teams cannot automatically trigger cleanup actions, notify external systems, release resources, or record audit data. This forces manual workarounds, increasing the risk of inconsistent states, missed notifications, and operational inefficiencies—particularly problematic in enterprise environments requiring strict process integrity and traceability.

## Release Notes

### Cancel event for execution listeners

Execution listeners now support a `cancel` event type. When a process instance is terminated or cancelled, the cancel listener fires — enabling cleanup actions, external notifications, and audit logging automatically.

## User Stories

- **As a developer**, I can define cancel execution listeners in my BPMN models so that I can execute custom logic when a process instance is cancelled.
- **As a developer**, I can access process instance context and cancellation details within the cancel listener so that I can make informed decisions about cleanup actions.
- **As an operations engineer**, I can verify the state and execution of cancel listeners in Operate so that I can ensure cleanup ran as expected.
- **As a developer**, I can read clear documentation on how to configure and use cancel execution listeners.
- **As a developer**, I can use existing start and end execution listeners alongside the new cancel listener without refactoring my process definitions.

## Implementation Notes

- New `cancel` event type for execution listeners on process definition
- Fires when instance is terminated due to process cancellation or explicit cancellation
- Listener job follows same pattern as `start` and `end` execution listeners
- Variables produced by cancel listener available for downstream logic
- Consistent behavior with user task listener `canceling` event (shipped in 8.8)
- Blocking operation, consistent with existing execution listeners
- Uses existing job worker infrastructure for listener execution
- Proper incident handling for failed listener executions

Make sure to read file `.swarm/sessions/e614c86d/analysis/repo-analysis.md` to get familiar with the repo.

## Follow up from camunda/camuna

The main change was already implemented in `camunda/camunda`, there was one engineering stream with the following comment to implement the remaining part here:

### Stream 4

The review feedback identifies one issue: the Desktop/Web Modeler properties panel change is marked as **TODO** in the design doc, and the actual implementation requires a PR to the external `bpmn-io/bpmn-js-properties-panel` repository.

Since `bpmn-js-properties-panel` is not a dependency in this repo (it's consumed by Desktop Modeler and Web Modeler which are separate products), this fix **cannot be implemented within this repository**. The required actions are:

1. **External PR** to [`bpmn-io/bpmn-js-properties-panel`](https://github.com/bpmn-io/bpmn-js-properties-panel) — add `cancel` to the execution listener event type dropdown options for process-level properties
2. **Dependency bump** in the Desktop/Web Modeler repos to consume the updated `bpmn-js-properties-panel` version
3. **Update the design doc** in this repo (lines 453-454) to mark the TODO as done once the above are merged

No in-repo code changes are needed or possible for this issue. The backend changes (enum additions, validation, engine processing, tests) are already in place and reviewed as coherent. Would you like me to create a tracking issue or draft the description for the external `bpmn-io/bpmn-js-properties-panel` PR instead?

## Research Context

### Study repo analysis document

Here's a summary of the repository analysis:

**bpmn-js-properties-panel** is a JavaScript library (v5.52.1, with v6.x in progress) that adds a configurable properties sidebar to bpmn-js modelers. It supports core BPMN, Camunda Platform 7, and Zeebe/Camunda 8 metadata editing.

**Key architecture points:**
- **UI:** Preact-based, rendered via `BpmnPropertiesPanelRenderer` DI service
- **Provider pipeline:** Providers implement `getGroups(element) => (groups) => groups`, composed by priority
- **Three provider scopes:** `src/provider/bpmn/`, `src/provider/zeebe/`, `src/provider/camunda-platform/`
- **Data flow:** Selection changes → providers compose groups → entry components read/write moddle values via `modeling.updateProperties` or command-stack → panel refreshes on change events

**For execution listener work**, the relevant paths are:
- **Zeebe provider:** `src/provider/zeebe/ZeebePropertiesProvider.js` and its `properties/` folder
- **Property modules** follow the `*Props.js` pattern exporting entry definitions
- **Tests** mirror source structure under `test/spec/provider/zeebe/`
- **New features** are wired by adding a group factory in the provider class and exporting from `properties/index.js`

**Commands:** `npm run all` (lint+test+distro), `npm test` (Karma), `npm run lint`, `npm run dev` (watch mode).

---

### Explore execution listener properties implementation

Here are the findings:

---

### **Zeebe (Camunda 8) — Execution Listeners**

**File 1: `src/provider/zeebe/properties/ExecutionListener.js`**
- **Lines 19–22**: `EVENT_TO_LABEL` maps `'start'` → `'Start'` and `'end'` → `'End'` (used for display labels).
- **Lines 98–112**: `getEventTypes(element)` returns the allowed event types per element:
  - `BoundaryEvent` / `StartEvent` → `['end']`
  - `EndEvent` with error definition → `['start']`
  - `Gateway` → `['start']`
  - Everything else → `['start', 'end']`
- **Lines 60–96**: `EventType` component renders a `SelectEntry` dropdown from the `eventTypes` array.

**File 2: `src/provider/zeebe/properties/ExecutionListenersProps.js`**
- **Lines 202–208**: `getDefaultListenerProps()` uses `getEventTypes(element)[0]` as the default when adding a new listener.

**To add `'cancel'` for Zeebe**, you'd modify:
1. `src/provider/zeebe/properties/ExecutionListener.js`:
   - Add `'cancel': 'Cancel'` to `EVENT_TO_LABEL` (line 21).
   - Add a condition in `getEventTypes()` returning `'cancel'` for the appropriate element types.

---

### **Camunda Platform (Camunda 7) — Execution Listeners**

**File: `src/provider/camunda-platform/properties/ListenerProps.js`**
- **Lines 92–102**: `EVENT_TO_LABEL` already has many event types (`start`, `end`, `take`, `create`, etc.).
- **Lines 264–284**: `getOptions()` in the `EventType` component hardcodes the dropdown options — execution listeners get `start`/`end`, sequence flows get `take`.
- To add `'cancel'` here, you'd add it to `EVENT_TO_LABEL` and to the `getOptions()` return array.

---

### Review upstream camunda changes

Here's the comprehensive research summary:

---

## Upstream `camunda/camunda` Analysis: Cancel Execution Listener

### 1. Event Type Enum (`ZeebeExecutionListenerEventType.java`)
Currently only **two** values on `main`:
```java
public enum ZeebeExecutionListenerEventType {
  start,
  end
}
```
The `cancel` value **has not yet landed** in this enum on `main`. The epic states engine changes are "already in place," suggesting it's on a feature branch or pending merge.

### 2. Job Protocol Enum (`JobListenerEventType.java`)
Already has `CANCELING` for **task listeners**, but no equivalent cancel type for execution listeners yet:
```
UNSPECIFIED, START, END, CREATING, ASSIGNING, UPDATING, COMPLETING, CANCELING
```

### 3. Validation (`ExecutionListenersValidator.java`)
- Validates parent element is in supported set (processes, tasks, events, gateways)
- Checks for duplicate `eventType + type` combinations
- **Does NOT validate event type values** — enforced by Java enum type system
- The moddle schema stores `eventType` as a free-form `String`, so `'cancel'` works without schema changes

### 4. Transformer (`ExecutionListenerTransformer.java`)
Transforms BPMN model listeners to engine elements. Requires `eventType`, `type`, and `retries` to be non-null. No event-type-specific logic.

### 5. Engine Processing (`ExecutableFlowNode.java`)
```java
getStartExecutionListeners()  → filters by ZeebeExecutionListenerEventType.start
getEndExecutionListeners()    → filters by ZeebeExecutionListenerEventType.end
// No getCancelExecutionListeners() yet
```

### 6. Conversion (`BpmnJobBehavior.java`)
```java
fromExecutionListenerEventType(eventType) {
  case start → JobListenerEventType.START;
  case end → JobListenerEventType.END;
  // No cancel case yet
}
```

### 7. What the Properties Panel Must Do
Per the epic (`.swarm/pdp2768.md`):
- **Scope**: Add `cancel` to execution listener event type dropdown **for process-level elements only**
- **Label**: `'Cancel'` (matches `start`→`Start`, `end`→`End` pattern)
- **Consistency**: Mirrors task listener's `canceling` event (shipped in 8.8)
- **Moddle**: No zeebe-bpmn-moddle schema change needed — `eventType` is `String` type

### 8. Key Implementation Pattern (from this repo)

**Current `ExecutionListener.js`**:
- `EVENT_TO_LABEL`: `{ start: 'Start', end: 'End' }`
- `getEventTypes(element)`: Returns subset based on element type (e.g., BoundaryEvent → `['end']` only)
- EventType dropdown only shown when `eventTypes.length > 1`

**Task listener analogy** (`TaskListener.js`):
- Already supports `canceling` with label `'Canceling'`
- Uses flat `EVENT_TYPE` array + `EVENT_TO_LABEL` map

### Required Changes Summary
1. Add `'cancel': 'Cancel'` to `EVENT_TO_LABEL` in `ExecutionListener.js`
2. Update `getEventTypes()` to include `'cancel'` for `bpmn:Process` (and possibly `bpmn:SubProcess`) elements
3. Add test fixtures and specs for the cancel event type on process-level elements

---

### Analyze Epic requirements and design

I'm unable to access this issue — it's in a private repository (`camunda/product-hub`) and I don't have authentication configured. Here's what I can do instead:

1. **Could you paste the issue content** (or the relevant sections) directly into the chat? I'll extract the acceptance criteria, design docs, event types, and UI/UX considerations from it.

2. Alternatively, if you can run `gh auth login` first and then ask me again, I can fetch it via the CLI.

3. If there are **linked design documents or Figma mockups**, please share those URLs or screenshots as well.

Which approach works best for you?

## Refined Requirements



---

## Structured Requirements Summary

### Problem Statement
Camunda 8 (Zeebe) execution listeners currently only support `start` and `end` event types. The engine is being extended to support a `cancel` event type that fires when a process instance is terminated or cancelled. The properties panel needs to expose this new option in the event type dropdown so modelers can configure cancel execution listeners.

### Scope
Add `cancel` to the execution listener event type dropdown **for process-level elements only** (`bpmn:Process`, accessed directly or via `bpmn:Participant`). This is a Zeebe/Camunda 8 change only — no Camunda Platform 7 changes needed.

### Acceptance Criteria
1. **`EVENT_TO_LABEL`** in `src/provider/zeebe/properties/ExecutionListener.js` includes `'cancel': 'Cancel'`
2. **`getEventTypes(element)`** returns `['start', 'end', 'cancel']` when the element is a `bpmn:Process` **or** a `bpmn:Participant` (resolving to its process via `processRef`)
3. **All non-process elements** retain existing behavior (`['start', 'end']`, `['start']`, or `['end']` as today)
4. **SubProcess elements** explicitly retain existing behavior (`['start', 'end']`) — `cancel` is only for top-level processes
5. **Event type dropdown** renders three options (Start, End, Cancel) when editing a process-level execution listener
6. **Default event type** for a new listener on a process or participant remains `start` (first element of the returned array)
7. **Existing tests pass** — no regressions
8. **New tests** cover:
   - Cancel event type displayed for `bpmn:Process`
   - Cancel event type displayed for `bpmn:Participant` (pool) element
   - Cancel event type selectable and updates correctly
   - SubProcess does **not** show cancel event type (negative case, guards against regression)

### Technical Requirements
- Modify `src/provider/zeebe/properties/ExecutionListener.js`:
  - Add `'cancel': 'Cancel'` to `EVENT_TO_LABEL`
  - Add a condition in `getEventTypes()` to return `['start', 'end', 'cancel']` for process-level elements. **Important:** `getEventTypes(element)` receives the raw diagram element, not a resolved business object. For a `bpmn:Participant`, the process must be resolved explicitly (e.g., `is(element, 'bpmn:Participant')` check, or resolving via `getBusinessObject(element).get('processRef')`). A simple `is(element, 'bpmn:Process')` check alone is **not sufficient** — it will miss Participants/pools.
  - `getDefaultListenerProps()` (which also calls `getEventTypes(element)`) will automatically benefit from the fix to `getEventTypes()`, ensuring new listeners added on a Participant also see `cancel` as available.
- Add/update test specs in `test/spec/provider/zeebe/ExecutionListenerProps.spec.js`
- May need to update BPMN test fixture to include a process with a cancel execution listener

### Edge Cases
- **Participant (pool)**: `ExecutionListenersProps.js` passes the **original diagram element** (the Participant shape) into `ExecutionListenerEntries()`, and `ExecutionListener.js` calls `getEventTypes(element)` with that same Participant shape. `getRelevantBusinessObject()` is only used to resolve the business object for listener CRUD operations — it does **not** feed into `getEventTypes()`. Therefore, `getEventTypes()` must explicitly handle `bpmn:Participant` (e.g., by checking `is(element, 'bpmn:Participant')` or resolving `processRef`) to return `['start', 'end', 'cancel']`.
- **SubProcess**: Per the epic ("process definition" / "process instance"), `cancel` should **not** be available for embedded subprocesses — only top-level processes. An explicit negative test must verify SubProcess still returns `['start', 'end']`.
- **Event type dropdown visibility**: With 3 event types, the dropdown is shown (existing logic: `eventTypes.length > 1`)
- **Label rendering**: `EVENT_TO_LABEL['cancel']` must be defined so the list item label renders correctly (`Cancel: {type}`)

### Out of Scope
- Camunda Platform 7 (`ListenerProps.js`) — no changes
- Moddle/schema changes — `eventType` is already a free-form `String` in zeebe-bpmn-moddle
- Engine-side implementation (already done in `camunda/camunda`)
- Dependency bumps in Desktop/Web Modeler repos

## Engineering Decisions

**

The requirements are well-specified and the codebase confirms every detail. Here's my technical summary:

### Changes Required

**1. `src/provider/zeebe/properties/ExecutionListener.js`:**
- Add `'cancel': 'Cancel'` to `EVENT_TO_LABEL` (line 19-22)
- Add a condition in `getEventTypes()` before the default return: if `is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')`, return `['start', 'end', 'cancel']`. This must come after the existing early-return guards (BoundaryEvent, StartEvent, EndEvent+Error, Gateway) but before the default `['start', 'end']` return.

**2. `test/spec/provider/zeebe/ExecutionListenerProps.bpmn`:**
- Add a `<bpmn:collaboration>` with a `<bpmn:participant>` referencing a new process, so we can test the Participant (pool) case. The existing standalone `Process` element already covers the `bpmn:Process` case.

**3. `test/spec/provider/zeebe/ExecutionListenerProps.spec.js`:**
- Add tests verifying cancel event type appears for `Process` and `Participant`
- Add negative test verifying `SubProcess` does NOT show cancel
- Add test verifying cancel is selectable and updates the model

### Key Technical Decisions
- `getEventTypes()` receives the raw diagram element, not a resolved BO — confirmed by reading `ExecutionListenersProps.js` line 53-56
- `getDefaultListenerProps()` calls `getEventTypes()` and uses `eventTypes[0]` — default remains `start` since it's first in the array
- No changes to `ExecutionListenersProps.js` needed — `getRelevantBusinessObject()` only handles BO resolution for CRUD, not event types
- SubProcess inherits the default `['start', 'end']` path since the new condition only matches `bpmn:Process` / `bpmn:Participant`

## Design Decisions

**

The requirements are comprehensive and well-specified. Here is my summary of design decisions and assumptions:

### Design Summary

**Visual & Interaction Pattern:** No new UI patterns are introduced. The change adds a third option (`Cancel`) to an existing `SelectEntry` dropdown that already renders `Start` and `End`. The dropdown is shown whenever `eventTypes.length > 1`, which remains satisfied.

**Label Rendering:** The list item label follows the existing template `${EVENT_TO_LABEL[eventType]}: {type}` (line 52 of `ExecutionListenersProps.js`), so a cancel listener will render as `Cancel: {type}` — consistent with `Start: {type}` and `End: {type}`.

**Scope Isolation:** The `cancel` option is context-sensitive — only appearing for `bpmn:Process` and `bpmn:Participant` elements. This matches the existing pattern where `getEventTypes()` already returns different arrays per element type (e.g., `['end']` for boundary events, `['start']` for gateways).

**Accessibility:** No concerns — the `SelectEntry` component from `@bpmn-io/properties-panel` already handles keyboard navigation, focus management, and ARIA attributes. Adding a third option doesn't change the interaction model.

**Default Behavior:** The default event type for new listeners is `eventTypes[0]`, which remains `start` since the new array is `['start', 'end', 'cancel']`. No change needed.

**Key Implementation Detail:** `getEventTypes()` receives the raw diagram element, not the resolved business object. For `bpmn:Participant`, an explicit `is(element, 'bpmn:Participant')` check is needed — `getRelevantBusinessObject()` resolves `processRef` for CRUD but does **not** feed into `getEventTypes()`.

## Technical Analysis

## Feasibility Assessment: Cancel Event Type for Zeebe Execution Listeners

### Complexity: **Low**

Additive change to an existing, well-structured feature. No architectural changes, no new dependencies, no breaking changes.

### Affected Files (3 total)

| File | Action |
|---|---|
| `src/provider/zeebe/properties/ExecutionListener.js` | Modify (~5 lines) |
| `test/spec/provider/zeebe/ExecutionListenerProps.spec.js` | Modify (~80-100 lines added) |
| `test/spec/provider/zeebe/ExecutionListenerProps-collaboration.bpmn` | **Create** (new fixture) |

### Approach

1. **`EVENT_TO_LABEL`** — add `'cancel': 'Cancel'` (line 21)
2. **`getEventTypes(element)`** — add condition before the default return:
   ```js
   if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
     return [ 'start', 'end', 'cancel' ];
   }
   ```
   This is safe because: existing guards (BoundaryEvent, StartEvent, error EndEvent, Gateway) never match Process/Participant, and `bpmn:SubProcess` extends `Activity`, not `Process`.
3. **Tests** — 4 new cases: cancel shown for Process, cancel shown for Participant (needs collaboration fixture following `VersionTagProps-collaboration.bpmn` pattern), cancel selectable/updates model, SubProcess does NOT show cancel (negative guard).

### Risks & Blockers

- **None blocking.** `eventType` is already a free-form `String` in zeebe-bpmn-moddle — no schema change needed. `getDefaultListenerProps()` automatically benefits since it calls `getEventTypes()`. The Participant case requires an explicit `is(element, 'bpmn:Participant')` check because `getEventTypes()` receives the raw diagram element, not the resolved business object.
