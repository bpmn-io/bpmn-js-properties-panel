# Changelog

All notable changes to [`@bpmn-io/bpmn-properties-panel`](https://github.com/bpmn-io/bpmn-properties-panel) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.5.1

* `CHORE`: replace textField with textArea for zeebe:userTaskForm input ([bfbe37d](https://github.com/bpmn-io/bpmn-properties-panel/commit/bfbe37d61095e235ce4a27d738cb638dcd69f991))
* `FIX`: fix label for zeebe:assignmentDefinition assignee input field ([0d44a1](https://github.com/bpmn-io/bpmn-properties-panel/commit/0d44a1e3d35d54b8d9c857c93d3d1818f707e45d))

## 0.5.0

* `FEAT`: support zeebe:assignmentDefinition for Camunda Cloud 1.3 ([#192](https://github.com/bpmn-io/bpmn-properties-panel/pull/192))

## 0.4.0

* `FEAT`: add provider for element templates ([#109](https://github.com/bpmn-io/bpmn-properties-panel/issues/109))
* `FEAT`: support zeebe:calledDecision for Camunda Cloud 1.3 ([#153](https://github.com/bpmn-io/bpmn-properties-panel/issues/153), [#162](https://github.com/bpmn-io/bpmn-properties-panel/issues/162))
* `FEAT`: ensure constraints are added to bottom ([#96](https://github.com/bpmn-io/bpmn-properties-panel/issues/96))
* `FEAT`: handle incompatible properties provider gracefully ([#119](https://github.com/bpmn-io/bpmn-properties-panel/pull/119))
* `FIX`: correct typo in console error message ([`a4027916`](https://github.com/bpmn-io/bpmn-properties-panel/commit/a402791662d2ea8e9b7ba1108ddf40d243e201a5))
* `FIX`: autoFocus first input for added constraints ([`e8ca4eca1`](https://github.com/bpmn-io/bpmn-properties-panel/commit/e8ca4eca1db02732b50265aa51f062607474bc39))
* `FIX`: ensure new errors are added to bottom ([`a93a703e`](https://github.com/bpmn-io/bpmn-properties-panel/commit/a93a703eafe39de068fe0d5ccc1bc8f4c9b0bb83))
* `FIX`: don't use browser defaults for undo/redo ([#135](https://github.com/bpmn-io/bpmn-properties-panel/pull/135))
* `DEPS`: bump to `zeebe-bpmn-moddle@0.9.0`
* `DEPS`: bump to `@bpmn-io/properties-panel@0.8.0`
* `DEPS`: bump to `diagram-js@7.5.0`
* `DEPS`: bump to `bpmn-js@8.8.2`

## 0.3.0

* `FEAT`: Implemented Camunda Platform Properties Provider ([#2](https://github.com/bpmn-io/bpmn-properties-panel/issues/2))
* `FEAT`: Support message throw and End Event in Zeebe Provider ([#114](https://github.com/bpmn-io/bpmn-properties-panel/pull/114))
* `DEPS`: bump to `diagram-js@7.4.0`
* `DEPS`: bump to `camunda-bpmn-moddle@6.1.0`
* `DEPS`: bump to `@bpmn-io/properties-panel@0.4.2`

## 0.2.0

* `FIX`: prevent auto focus list behavior when switching elements ([#65](https://github.com/bpmn-io/bpmn-properties-panel/issues/65))
* `FIX`: use correct icon for signal boundary event ([#72](https://github.com/bpmn-io/bpmn-properties-panel/issues/72))
* `CHORE`: cleanup structure of BPMN properties provider ([`1a1f43ce`](https://github.com/bpmn-io/bpmn-properties-panel/commit/1a1f43ceb48a7d877511d73465693cb2719dd3ca))
* `CHORE`: update list item ids to be unique per element ([#63](https://github.com/bpmn-io/bpmn-properties-panel/pull/63))
* `CHORE`: remove unnecessary button classes ([#74](https://github.com/bpmn-io/bpmn-properties-panel/pull/74))
* `CHORE`: bump to `@bpmn-io/properties-panel@v0.3.0`

## 0.1.1

* `FIX`: deduplicate preact dependencies during testing ([#29](https://github.com/bpmn-io/bpmn-properties-panel/pull/29))
* `FIX`: decouple `attachTo` and `render` ([#40](https://github.com/bpmn-io/bpmn-properties-panel/pull/40))
* `CHORE`: bump to `@bpmn-io/properties-panel@v0.2.0`

## 0.1.0

* `FEAT`: initial version :tada:
