# Changelog

All notable changes to [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

* `FEAT`: allow to provide custom FEEL popup
* `FEAT`: make list headers sticky ([bpmn-io/properties-panel#397](https://github.com/bpmn-io/properties-panel/pull/397))
* `DEPS`: update to `@bpmn-io/properties-panel@3.30.0`

## 5.37.0

* `FEAT`: support `creating` and `canceling` task listeners
* `FIX`: correctly update condition entry
* `DEPS`: update to `@bpmn-io/properties-panel@3.27.3`

## 5.36.1

* `FIX`: show literal values in FEEL suggestions
* `DEPS`: update to `@bpmn-io/feel-editor@1.10.1`

## 5.36.0

* `FEAT`: trim whitespace in entries
* `FIX`: add empty alt attribute for icons
* `DEPS`: update to `@bpmn-io/properties-panel@3.27.1`

## 5.35.0

* `FEAT`: update ad-hoc subprocess completion docs link ([#1116](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1116))

## 5.34.2

* `DEPS`: update to `@bpmn-io/properties-panel@3.26.4`
* `FIX`: reverts trim trailing whitespaces from all input fields except expressions ([bpmn-io/properties-panel#309](https://github.com/bpmn-io/properties-panel/issues/309)) added in `5.33.0`

## 5.34.1

* `FIX`: clarify wording for input/output groups ([#1115](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1115))

## 5.34.0

* `FEAT`: add completion group for ad-hoc subprocess ([#1114](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1114))

## 5.33.0

* `FEAT`: trim trailing whitespaces from all input fields except expressions ([bpmn-io/properties-panel#309](https://github.com/bpmn-io/properties-panel/issues/309))
* `DEPS`: update to `@bpmn-io/properties-panel@3.26.3`

## 5.32.1

* `FIX`: add `subscription correlated key` missing tooltip ([#1109](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1109))
* `FIX`: add focus to checkboxes and buttons ([bpmn-io/properties-panel#390](https://github.com/bpmn-io/properties-panel/pull/390))
* `FIX`: remove input border from popups ([bpmn-io/properties-panel#398](https://github.com/bpmn-io/properties-panel/pull/398))
* `FIX`: make tooltip persist when trying to copy from it ([bpmn-io/properties-panel#399](https://github.com/bpmn-io/properties-panel/pull/399))
* `DEPS`: update to `@bpmn-io/properties-panel@3.26.2`

## 5.32.0

* `FEAT`: add `updating` event type for task listeners ([#1104](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1104))

## 5.31.1

* `CHORE`: fix import paths ([#1106](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1106))

## 5.31.0

* `FEAT`: support ad-hoc subprocess ([#1105](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1105))
* `DEPS`: update to `zeebe-bpmn-moddle@1.9.0`

## 5.30.1

* `FIX`: ensure logical order of task listener event types ([#1102](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1102))

## 5.30.0

* `FEAT`: rename task listener event types ([#1098](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1098))

## 5.29.0

* `FEAT`: rename "Zeebe user task" to "Camunda user task" ([#1097](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1097))

## 5.28.0

* `FEAT`: make properties panel container focusable ([#1095](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1095))

## 5.27.0

* `FEAT`: support Zeebe task listeners ([#1088](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1088))
* `DEPS`: update to `zeebe-bpmn-moddle@1.7.0`
* `DEPS`: update to `camunda-bpmn-js-behaviors@1.7.1`

## 5.26.0

* `FEAT`: make FEEL popup links configurable ([#1083](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1083))

## 5.25.0

_No functional changes._

* `DEPS`: bump to `@bpmn-io/extract-process-variables@1.0.0`

## 5.24.0

* `FEAT`: lint first item access ([bpmn-io/feel-lint#25](https://github.com/bpmn-io/feel-lint/issues/25))
* `FEAT`: suggest Camunda 8.6 FEEL built-ins
* `DEPS`: update to `@bpmn-io/properties-panel@3.24.1`

## 5.23.2

* `FIX`: only show `zeebe:priorityDefinition` for Zeebe user tasks ([#1077](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1077))

## 5.23.1

* `FIX`: prevent focus loss of _Binding_ and _Version tag_ entries ([#1076](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1076))

## 5.23.0

* `FEAT`: support maintaning `Version Tag` for Camunda 8 diagrams ([#1062](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/1062))
* `DEPS`: update to `camunda-bpmn-js-behaviors@1.6.0`
* `DEPS`: update to `zeebe-bpmn-moddle@1.6.0`

## 5.22.0

* `FEAT`: support maintaining `zeebe:priorityDefinition:priority` for user task ([#1072](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1072))
* `FIX`: rename task definition type label ([#1070](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1070))
* `DEPS`: update to `zeebe-bpmn-moddle@1.5.1`

## 5.21.0

* `FEAT`: automatically resize text areas ([#713](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/713))
* `DEPS`: update to `@bpmn-io/properties-panel@3.23.0`

## 5.20.0

* `FEAT`: add `Binding` entry to busines rule task, call activity and user task ([#1067](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1067))
* `DEPS`: update to `@bpmn-io/properties-panel@3.22.4`
* `DEPS`: update to `camunda-bpmn-js-behaviors@1.5.0`
* `DEPS`: update to `zeebe-bpmn-moddle@1.4.0`

## 5.19.0

* `FEAT`: support Zeebe execution listeners ([#1048](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1048))
* `DEPS`: update to `camunda-bpmn-js-behaviors@1.4.0`
* `DEPS`: update to `zeebe-bpmn-moddle@1.2.0`

## 5.18.1

* `FEAT`: change Header value and Field Injection value fields to text areas ([bpmn-io/bpmn-js-properties-panel#1065](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1065))
* `DEPS`: update to `@bpmn-io/properties-panel@3.22.3`

## 5.18.0

* `FEAT`: move popup editor close button ([bpmn-io/properties-panel#368](https://github.com/bpmn-io/properties-panel/pull/368))
* `FIX`: prevent list group rendering with outdated components ([bpmn-io/properties-panel#369](https://github.com/bpmn-io/properties-panel/pull/369))
* `DEPS`: update to `@bpmn-io/properties-panel@3.21.0`

## 5.17.1

* `FIX`: correct duplicate `Process Name` ([#1055](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1055))

## 5.17.0

* `FEAT`: drop alphabetic sorting of list entries ([#1047](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1047))
* `DEPS`: update to `@bpmn-io/properties-panel@3.19.0`

## 5.16.0

* `FEAT`: add hint for the process ID field in the Camunda 7 ([#1038](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/1038))

## 5.15.0

* `FEAT`: add tooltip for `Called decision` group ([#1039](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/1039))
* `FIX`: add missing translations ([#1044](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1044))
* `DEPS`: update to `@bpmn-io/variable-resolver@1.2.2`
* `DEPS`: update to `@bpmn-io/properties-panel@3.18.2`

## 5.14.0

* `FEAT`: add user task implementation tooltip ([#1033](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1033), [#1032](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1032))
* `FEAT`: update form selection tooltip ([#1035](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1035))

## 5.13.0

* `FEAT`: support `zeebe:userTask` ([#1026](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1026))
* `DEPS`: update to `zeebe-bpmn-moddle@1.1.0`
* `DEPS`: update to `camunda-bpmn-js-behaviors@1.3.0`

## 5.12.0

* `FEAT`: add HTTL hint to Camunda 7 ([#1028](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1028))

## 5.11.2

* `FIX`: correct retires tooltip ([#1029](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1029))
* `FIX`: do not offer output mapping for terminate end event ([#1027](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1027))

## 5.11.1

* `FIX`: correct `id` validation ([#1022](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1022))
* `DEPS`: update to `@bpmn-io/properties-panel@3.18.1`

## 5.11.0

* `FEAT`: simplify FEEL editor external error ([bpmn-io/properties-panel#97](https://github.com/camunda/linting/pull/97), [#1018](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/1018))
* `FEAT`: remove unnecessary resizer ([bpmn-io/properties-panel@`b2f6752`](https://github.com/bpmn-io/properties-panel/commit/b2f6752de3827384452d4b4c0b27bd269b7b5ad4))
* `FIX`: attach popup editor toggle to the top ([bpmn-io/properties-panel@`e6681f7`](https://github.com/bpmn-io/properties-panel/commit/e6681f74ad6268c8f533a721351bdeea376dac26))
* `FIX`: close popup editor when properties panel gets detached ([bpmn-io/properties-panel@`7defc52`](https://github.com/bpmn-io/properties-panel/commit/7defc525400c62f253651cda589fe2f5058518a6))
* `FIX`: close popup editor when source component gets unmounted ([bpmn-io/properties-panel@`1fa3330`](https://github.com/bpmn-io/properties-panel/commit/1fa3330ebdcbc7c0ac405a49eb510817fc3aa71c))
* `FIX`: correct re-validation of entries when validator changes ([bpmn-io/properties-panel@`e93e986`](https://github.com/bpmn-io/properties-panel/commit/e93e986573d32adc361c64a1bc53cf1e38454715))
* `DEPS`: update to `@bpmn-io/properties-panel@3.18.0`

## 5.10.0

* `FEAT`: improve variable events tooltip ([#1016](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1016))

## 5.9.0

* `DEPS`: update to `@bpmn-io/variable-resolver@1.2.1`

## 5.8.0

* `FEAT`: header displays element template icon found in XML ([#1012](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1012))
* `FEAT`: automatically add line-breaks for FEEL expressions ([bpmn-io/properties-panel#319](https://github.com/bpmn-io/properties-panel/pull/319))
* `FIX`: show scroll bars in FEEL popup editor ([bpmn-io/properties-panel#319](https://github.com/bpmn-io/properties-panel/pull/319))
* `DEPS`: update to `@bpmn-io/properties-panel@3.16.0`

## 5.7.0

* `FEAT`: capitalize `Camunda Form` ([#1005](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/1005))
* `FEAT`: improve FEEL popup editor icon ([bpmn-io/properties-panel#310](https://github.com/bpmn-io/properties-panel/issues/310))
* `FIX`: prevent error inside web component ([bpmn-io/properties-panel#313](https://github.com/bpmn-io/properties-panel/issues/313))
* `DEPS`: update to `@bpmn-io/properties-panel@3.14.0`

## 5.6.1

* `FIX`: do not unset form type when setting value to empty ([#998](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/998))
* `CHORE`: adjust Forms group tooltip to include linked forms ([#999](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/999))

## 5.6.0

* `FEAT`: support Camunda 8 form reference ([#978](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/978), [#949](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/949))
* `FEAT`: allow `PopupContainer` to be a CSS selector ([bpmn-io/properties-panel#291](https://github.com/bpmn-io/properties-panel/issues/291))
* `FEAT`: improve suggestion of local variables ([#984](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/984))
* `FIX`: add error style to popup editor opened fields ([bpmn-io/properties-panel#298](https://github.com/bpmn-io/properties-panel/pull/298))
* `FIX`: allow value `0` in FEEL number fields ([bpmn-io/properties-panel#297](https://github.com/bpmn-io/properties-panel/pull/297))
* `FIX`: keep undo/redo stack when editing Camunda input/output properties ([#983](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/983))
* `DEPS`: update to `@bpmn-io/properties-panel@3.11.0`

## 5.5.0

* `FEAT`: improve FEEL popup lifecycle events ([bpmn-io/properties-panel#294](https://github.com/bpmn-io/properties-panel/pull/294))
* `FEAT`: add drag trap to popup component ([bpmn-io/properties-panel#289](https://github.com/bpmn-io/properties-panel/issues/289))
* `FEAT`: allow listen to `feelPopup.dragstart`, `feelPopup.dragover` and `feelPopup.dragend` events ([bpmn-io/properties-panel#299](https://github.com/bpmn-io/properties-panel/pull/292))

## 5.4.0

* `FEAT`: allow listen to `feelPopup.opened` and `feelPopup.closed` events ([#974](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/974))
* `FEAT`: provide `feelPopup` module to interact with FEEL popup ([#974](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/974))
* `DEPS`: update to `@bpmn-io/properties-panel@3.7.0`

## 5.3.0

* `FEAT`: prioritize externally provided errors ([bpmn-io/properties-panel@`375838b7`](https://github.com/bpmn-io/properties-panel/commit/375838b7c82b559a579792a46479592efcd5f500))
* `FEAT`: specify FEEL popup container via `propertiesPanel.feelPopupContainer` ([bpmn-io/properties-panel#970](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/970))
* `FIX`: correct FEEL popup editor closing during auto-suggest ([bpmn-io/properties-panel#279](https://github.com/bpmn-io/properties-panel/issues/279))
* `FIX`: contain keyboard events within the FEEL popup editor ([bpmn-io/properties-panel@`a8dd384`](https://github.com/bpmn-io/properties-panel/commit/a8dd384ad625adb03272a9bc2e25fc4aab7bb284))
* `DEPS`: update to `@bpmn-io/variable-resolver@1.2.0`
* `DEPS`: update to `@bpmn-io/properties-panel@3.6.0`

## 5.2.0

* `FEAT`: improve tooltip content ([#955](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/955))

## 5.1.0

* `FEAT`: add _Input propagation_ group ([#954](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/954))
* `DEPS`: update to `@bpmn-io/properties-panel@3.4.0`

## 5.0.0

* `FEAT`: add FEEL popup editor ([bpmn-io/properties-panel#265](https://github.com/bpmn-io/properties-panel/pull/265))
* `CHORE`: remove `properties-panel.css` ([#958](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/958))
* `CHORE`: remove `element-template.css` ([#956](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/956))
* `FIX`: remove output group from error end events ([#952](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/952))
* `DEPS`: update to `@bpmn-io/properties-panel@3.3.2` ([#958](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/958))

### Breaking Changes

* `dist/assets/properties-panel.css` is no longer published from this package. Please use [`bpmn-js-element-templates/dist/assets/properties-panel.css`](https://github.com/bpmn-io/bpmn-js-element-templates) instead.
* `dist/assets/properties-panel.css` is no longer published from this package. Please use [`@bpmn-io/properties-panel/dist/assets/properties-panel.css`](https://github.com/bpmn-io/properties-panel) instead.

## 4.0.2

* `DEPS`: update to `@bpmn-io/properties-panel@3.2.1`

## 4.0.1

* `DEPS`: update to `@bpmn-io/properties-panel@3.2.0`

## 4.0.0

* `FEAT`: migrate long descriptions and descriptions with documentation links to tooltips ([#946](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/946))
* `FEAT`: allow to set tooltips via context ([#946](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/946))

### Breaking Changes

* `ZeebeDescriptionProvider` is no longer exported with this library, use `ZeebeTooltipProvider` instead.

## 3.0.0

* `FEAT`: support line breaks in FEEL statements ([#879](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/879))
* `CHORE`: remove element templates ([#937](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/937))
* `DEPS`: update to `@bpmn-io/properties-panel@3.0.0`

### Breaking Changes

* Element Template Modules are no longer exported from this package. Please use [`bpmn-js-element-templates`](https://github.com/bpmn-io/bpmn-js-element-templates) instead.

## 2.1.0

* `FEAT`: add `ElementTemplates#unlinkTemplate` and `ElementTemplates#removeTemplate` API ([#935](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/935))

## 2.0.0

* `FEAT`: remove templated `bpmn:Message` if no message bindings are active ([#915](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/915))
* `FEAT`: allow time date in boundary and intermediate catch events ([#931](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/931))

### Breaking Changes

* support of legacy `timerEventDefinitionDurationValue` ID for Camunda 8 _Timer_ group _Value_ entry was removed; `timerEventDefinitionValue` ID is now used for all _Value_ entries ([#931](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/931))

## 1.26.0

* `FEAT`: change FEEL toggle ([@bpmn-io/properties-panel#240](https://github.com/bpmn-io/properties-panel/issues/240))
* `DEPS`: update to `@bpmn-io/properties-panel@2.2.0`

## 1.25.0

* `FEAT`: fire `elementTemplats.unlink`, `elementTemplats.update` and `elementTemplats.remove` events ([#927](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/927))

## 1.24.1

* `FIX`: handle `undefined` values in custom properties validator ([#926](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/926))

## 1.24.0

* `FEAT`: validate custom dropdown and textArea entries ([#922](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/922))
* `FIX`: allow to configure variable events for conditional start event in event subprocess ([#925](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/925))
* `FIX`: unlink templated message instead of removing ([#914](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/914))
* `DEPS`: update to `@bpmn-io/properties-panel@2.0.0`

## 1.23.0

* `FEAT`: add _Inputs_ group for signal intermediate throw and end events ([#911](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/911))
* `FEAT`: change signal _Name_ entry to optional FEEL entry ([#911](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/911))

## 1.22.1

* `FIX`: do not unlink none event templates ([#917](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/917))

## 1.22.0

* `FEAT`: support `bpmn:Message` templating in events ([#890](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/890))c
* `FEAT`: support `generatedValue` in templates ([#890](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/890))
* `FEAT`: suggest variables for templates properties ([#904](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/904))
* `FIX`: separate Camunda 7 and BPMN concerns in Timer Props ([#910](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/910))
* `DEPS`: update to `@bpmn-io/element-templates-validator@0.14.0`
* `DEPS`: update to `zeebe-bpmn-moddle@0.19.0`
* `DEPS`: support bpmn-js >=11.5 and diagram-js >=11.9

## 1.21.0

* `FEAT`: add `setLayout` method to change the layout of a properties panel instance ([#891](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/891))

## 1.20.3

* `FIX`: only provide variable suggestions for fields backed by IO mappings ([#902](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/902)

## 1.20.2

* `DEPS`: update to `@bpmn-io/variable-resolver@0.1.3`

## 1.20.1

* `FIX`: ensure element template properties order is maintained ([#898](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/898))

## 1.20.0

* `FEAT`: add Due date and Follow up date properties ([#889](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/889))
* `CHORE`: update to `camunda-bpmn-js-behaviors@0.5.0`
* `CHORE`: update to `zeebe-bpmn-moddle@0.18.0`

## 1.19.1

* `CHORE`: keep variable name and expression order consistent ([#886](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/886))

## 1.19.0

* `FEAT`: support multiple property conditions ([#884](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/884))

## 1.18.0

* `FEAT`: support optional `zeebe:taskHeader` bindings ([#840](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/840))
* `FEAT`: use `variablesResolver` service, when registered ([#881](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/881))
* `FIX`: evaluate conditional properties on `createElement` ([#878](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/878))

## 1.17.2

* `FIX`: don't apply default template during paste ([#877](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/877))

## 1.17.1

* `DEPS`: update to `@bpmn-io/properties-panel@1.3.1`

## 1.17.0

* `FEAT`: Camunda 8 template properties can have `language` property ([#869](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/869))
* `FEAT`: Camunda 8 template properties of type `Text` are resizable textareas ([#870](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/870))
* `FIX`: _Name_ entry is resizable textarea ([#864](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/864))
* `FIX`: _Extension properties_ group is shown for all elements ([#861](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/861))
* `FIX`: _Extension properties_ can be removed from participant ([#862](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/862))
* `FIX`: _Extension properties_ and _Headers_ are not sorted alphabetically ([#867](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/867))
* `FIX`: result variables of script tasks are shown in FEEL suggestions ([extract-process-variables#25](https://github.com/bpmn-io/extract-process-variables/issues/25))
* `DEPS`: update to `@bpmn-io/extract-process-variables@0.8.0`
* `DEPS`: update to `@bpmn-io/properties-panel@1.3.0`

## 1.16.0

* `FEAT`: allow escalation code to be a FEEL expression ([#855](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/855))
* `FIX`: use FEEL editor for error code in throw events only
* `FIX`: make it possible to clear `optional` `Dropdown` field defined through element template ([#834](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/834))
* `FIX`: remove task headers when implementation set to none ([#826](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/826))

## 1.15.1

* `FIX`: don't stop propagation of events ([#850](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/850))

## 1.15.0

* `FIX`: serialize templated properties in stable order ([#838](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/838))
* `FIX`: do not sort IO mappings alphabetically ([#845](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/845), [#843](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/843))
* `DEPS`: update to `@bpmn-io/extract-process-variables@0.7.0`

## 1.14.0

* `FEAT`: allow to set error code as FEEL expression ([#836](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/836))

## 1.13.1

* `FIX`: correct element template defined `Dropdown` showing incorrect value ([`b3248fea`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/b3248fea0a19dabca7a9b969121cf07fba7a8f0a))
* `DEPS`: update to `@bpmn-io/properties-panel@1.1.1`

## 1.13.0

* `FEAT`: add FEEL expression implementation for Script Task ([#825](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/825))
* `DEPS`: update to `@bpmn-io/properties-panel@1.0.1` ([#810](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/810))

## 1.12.0

* `FEAT`: update available variables on commandstack changes ([#393](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/814))
* `FEAT`: configure feel tooltip placement using the properties panel configuration ([#393](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/814))
* `DEPS`: update to `@bpmn-io/properties-panel@1.0.0`

## 1.11.3

* `FIX`: render conditional properties with same binding reliably ([#824](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/824))

## 1.11.2

* `FIX`: ensure `ImplementationProps` does not remove empty properties ([#811](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/811))

## 1.11.1

* `FIX`: update peer dependencies to ensure compatibility

## 1.11.0

* `FEAT`: add candidate users entry to assignment group ([#776](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/776))
* `DEPS`: update to `@bpmn-io/properties-panel@0.24.0`
* `DEPS`: update to `diagram-js@10.0.0`

## 1.10.0

* `FEAT`: allow to translate group names ([#798](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/798))
* `FIX`: remove `timeCycle` property in interrupting timer start event ([#802](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/802))

## 1.9.0

* `DEPS`: update to `@bpmn-io/element-templates-validator@0.11.0`
* `DEPS`: update to `@bpmn-io/extract-process-variables@0.6.0`
* `CHORE`: relax peer dependency ranges

## 1.8.2

* `FIX`: correct replace removing valid dropdown property ([#767](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/767))

## 1.8.1

* `DEPS`: mark as `bpmn-js@10` compatible
* `FIX`: include `@bpmn-io/properties-panel@0.22.0` in peer dependency range

## 1.8.0

* `FEAT`: support cron expressions for timer cycle ([#772](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/772))
* `FIX`: unset timer type correctly ([#775](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/775))
* `DEPS`: update to `@bpmn-io/properties-panel@0.22.0`

## 1.7.0

* `FEAT`: show conditions group if source is inclusive gateway ([#756](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/756))
* `FEAT`: support element template properties without default value ([#763](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/763))
* `FEAT`: support deprecated element templates ([#766](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/766))
* `FIX`: support `zeebe:property` binding for creation of elements from element templates ([#762](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/762))
* `FIX`: support conditional properties for creation of elements from element templates ([#762](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/762))
* `CHORE`: remove default values from _Variable assignment value_ of _Input_ and _Output_ ([#757](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/757))
* `DEPS`: update to `@bpmn-io/properties-panel@0.21.0`

## 1.6.1

* `DEPS`: update to `@bpmn-io/properties-panel@0.20.1`
* `DEPS`: update to `@bpmn-io/element-templates-icons-renderer@0.2.0`
* `DEPS`: update to `diagram-js@8.9.0`
* `DEPS`: update to `bpmn-js@9.4.1`

## 1.6.0

* `FEAT`: support `zeebe:property` ([#731](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/731))
* `FIX`: copy full `FEEL` expression ([#728](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/728))
* `FIX`: don't serialize `zeebe:taskHeader` template bindings without a value ([#684](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/684))
* `DEPS`: update to `@bpmn-io/properties-panel@0.20.0`

## 1.5.0

* `FEAT`: explicitly bind undo/redo to properties container ([#739](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/739))
* `FIX`: render sticky headers correctly ([#726](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/726))
* `FIX`: prevent undo events from affecting the wrong element ([#712](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/712))
* `CHORE`: set `bpmn:Group` label in a side-effect free manner ([#739](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/739))
* `CHORE`: update formType documentation link ([cb627c4](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/cb627c4e2c21aef5f37c4723f2cdb219a66ee310))
* `DEPS`: update to `@bpmn-io/properties-panel@0.19.0`
* `DEPS`: update to `bpmn-js@9.3.2`
* `DEPS`: update to `diagram-js@8.8.0`
* `DEPS`: update to `zeebe-bpmn-moddle@0.12.2`

## 1.4.0

* `FEAT`: use FEEL editor for FEEL expressions ([#706](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/706))
* `FIX`: support jQuery as parent node ([#729](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/729))
* `DEPS`: update to `@bpmn-io/properties-panel@0.18.0`
* `DEPS`: update to `@bpmn-io/extract-process-variables@0.5.0`

## 1.3.0

* `FEAT`: set errors through context ([#160](https://github.com/bpmn-io/properties-panel/pull/160))
* `DEPS`: update to `@bpmn-io/properties-panel@0.16.0`
* `DEPS`: update to `bpmn-js@9.3.0`

## 1.2.0

* `FEAT`: enable multi-select state ([#687](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/678))
* `FEAT`: display timestamp for template versions ([#698](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/698))
* `FIX`: called decision decision ID made explicit ([#681](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/681))
* `FIX`: focus value on create for form field of type enum ([#683](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/683))
* `FIX`: add separator to process variable sources ([#714](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/714))
* `FIX`: fix error when field injection for execution listener is created ([#710](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/710)
* `CHORE`: fix audit errors ([#691](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/691))
* `CHORE`: use codecov Github action ([#699](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/699))
* `DEPS`: update to `bpmn-js@9.2.2`
* `DEPS`: update to `diagram-js@8.6.0`
* `DEPS`: update to `element-templates-validator@0.9.0`

## 1.1.1

### Element Templates

* `FIX`: keep existing configuration after apply ([#661](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/661))
* `FIX`: always override `hidden` configuration on apply ([#661](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/661))
* `FIX`: do not render non-existing values ([#676](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/676))
* `FIX`: pick-up correct template icon ([#670](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/670))

## 1.1.0

* `deps`: add `camunda-bpmn-js-behaviors` dependency ([#671](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/671))

## 1.0.0

_A complete rewrite of the library, based on modern foundations._

* `FEAT`: rewrite project to new, [@bpmn-io/properties-panel](https://github.com/bpmn-io/properties-panel)-based architecture
* `FEAT`: replace tabs with flat structure where groups are basic building blocks
* `FEAT`: add "dirty" markers to notify non-default value of entry/entries in group
* `FEAT`: keep open/closed state of the groups between elements
* `FIX`: keep element name after template removal ([#570](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/570))
* `CHORE`: add description for decision ID ([`5c8f9f2`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/5c8f9f2f3dea085371b5fee3c7b29c8c4d34192c))

For more changes, read the alpha releases entries below.

### Breaking Changes

* `PropertiesProvider#getTabs` is no longer used. Migrate to the new `PropertiesProvider#getGroups` API instead.
  Check out [the example migration](https://github.com/bpmn-io/bpmn-js-examples/pull/142) and [this pull request](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/590) for guidance.
* Previously exported entry factory functions are no longer available. Use components exported from
  [`@bpmn-io/properties-panel`](https://github.com/bpmn-io/properties-panel) instead.
* Element templates select has been removed. Handle [`elementTemplates.select` event](https://github.com/bpmn-io/bpmn-js-properties-panel/blob/v1.0.0-alpha.0/src/provider/element-templates/components/ElementTemplatesGroup.js#L132) or use [the element template chooser](https://github.com/bpmn-io/element-template-chooser) to implement template selection.

## 1.0.0-alpha.13

* `DEPS`: update to `@bpmn-io/properties-panel@0.13.2` ([#660](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/660))
* `FIX`: only keep defined mappings (cloud-templates) ([#659](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/659))
* `FEAT`: rearrange process props by relevance ([#656](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/656))

## 1.0.0-alpha.12

* `FIX`: move `modelerTemplateIcon` to property ([#658](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/658))

## 1.0.0-alpha.11

* `FEAT`: apply element template icons ([#641](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/641))
* `FEAT`: change task type when element template is applied ([#648](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/648))
* `FEAT`: display element template icons in header ([#650](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/650))
* `FEAT`: add show callbacks to show error code and message name errors ([#654](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/654))
* `FIX`: add `Variable name` entry to `Condition` group ([#651](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/651))

## 1.0.0-alpha.10

* `FIX`: do not use `inherits` ([#645](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/645))
* `FIX`: use `browser` field of dependencies before falling back to `module` and `main` ([#646](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/646))

## 1.0.0-alpha.9

* `FEAT`: add show callbacks to show entries and errors ([#601](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/601))
* `FEAT`: open element template custom groups ([#621](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/621))
* `FEAT`: display template name in header ([#627](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/627))
* `FEAT`: add documentation ref to header ([#629](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/629))
* `FIX`: copy versioned element template ([#632](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/632))
* `FIX`: use correct business object ([#634](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/634))
* `FIX`: mark called decision ID as optionally FEEL ([#643](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/643))
* `DEPS`: update to `@bpmn-io/extract-process-variables@v0.4.5`
* `DEPS`: update to `@bpmn-io/properties-panel@0.13.1`

## 1.0.0-alpha.8

* `FIX`: correct display of messages ([#623](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/623))

## 1.0.0-alpha.7

* `FEAT`: add `ElementTemplates#applyTemplate` API ([#624](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/624))
* `FEAT`: provide UMD distribution
* `DEPS`: replace `semver` with `semver-compare` ([#622](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/622))

## 1.0.0-alpha.6

* `FEAT`: add `elementTemplates.createElement` API for `cloud-element-templates` ([#582](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/582))
* `FEAT`: allow setting custom form key ([#592](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/592))
* `FEAT`: reorder select options for implementation properties ([#597](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/597))
* `FEAT`: mark FEEL expressions on input fields ([#599](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/599))
* `FEAT`: add FEEL guidance on element templates ([#606](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/606))
* `FEAT`: add references for `formType`, `throwEvent`, `user` and `multiInstance` ([#612](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/612))
* `FIX`: set DMN implementation default to `<none>` ([#578](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/578))
* `DEPS`: update to `bpmn-js@9.0.3`

## 1.0.0-alpha.5

* `FEAT`: validate cloud element templates against JSON Schema ([#561](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/561))
* `FEAT`: use components instead of elements for all entries ([#590](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/590))
* `FIX`: set correct title to element templates select ([#591](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/591))
* `DEPS`: update to `@bpmn-io/properties-panel@0.11.0`
* `DEPS`: update to `@bpmn-io/element-templates-validator@0.5.0`

### Breaking Changes

* `component` property of an entry must be an actual component, not an element.
Checkout this [pull request](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/590) as a guidance.

## 1.0.0-alpha.4

* `FIX`: ensure compatibility with bpmn-js@8 ([#581](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/581))
* `FIX`: reference missing adhoc subprocess icons ([#583](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/583))

## 1.0.0-alpha.3

* `FEAT`: add ability to create optional inputs & outputs ([#559](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/559))
* `FEAT`: support drilldown ([#567](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/567))
* `FEAT`: add templates property groups ([#563](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/563), [#564](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/564))
* `FEAT`: add element templates support ([#540](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/540))
* `FIX`: remove name property on associations ([#566](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/566), [#579](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/566))
* `DEPS`: update to `zeebe-bpmn-moddle@0.11.0`
* `DEPS`: update to `bpmn-js@9.0.0-alpha.2`

## 1.0.0-alpha.1

* `FEAT`: expose ZeebeDescriptionProvider ([c4b565](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/c4b565df6f861205f6df63a3e265375e0b10d4e7))
* `FEAT`: re-enable `zeebe:calledDecision` ([dc32ec](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/dc32ecfed99cf1680bd7ff2ba126b664e6044040))
* `FEAT`: support completion-condition for multi-instance ([324128](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/32412883e37c773b0d32329ec6e0ce8c87e0c2eb))
* `FIX`: don't render empty element template descriptions ([656f80](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/656f801c22d2c0d30df0b1c1ef4f80ebbf3b880d))
* `FIX`: allow rendering of HTML descriptions ([#547](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/547) and [#375](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/375))
* `FIX`: update instead of destroy new root element ([b5a29d](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/b5a29d41d5493d3a35be9b19a961257d46def4af))
* `FIX`: reorder unlink / remove actions in dropdown ([#498](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/498))
* `DEPS`: bump to `bpmn-js@8.9.1`

## 1.0.0-alpha.0

* `FEAT`: rewrite project to new, [@bpmn-io/properties-panel](https://github.com/bpmn-io/properties-panel)-based architecture
* `FEAT`: replace tabs with flat structure where groups are basic building blocks
* `FEAT`: add "dirty" markers to notify non-default value of entry/entries in group
* `FEAT`: keep open/closed state of the groups between elements

### Breaking Changes

* `PropertiesProvider#getTabs` is no longer used. Migrate to the new `PropertiesProvider#getGroups` API instead.
  Check out [the example migration](https://github.com/bpmn-io/bpmn-js-examples/pull/142) for guidance.
* Previously exported entry factory functions are no longer available. Use components exported from
  [`@bpmn-io/properties-panel`](https://github.com/bpmn-io/properties-panel) instead.
* Element templates select has been removed. Handle [`elementTemplates.select` event](https://github.com/bpmn-io/bpmn-js-properties-panel/blob/v1.0.0-alpha.0/src/provider/element-templates/components/ElementTemplatesGroup.js#L132) to implement template selection.

## 0.46.0

* `FEAT`: graceful handle incompatible properties providers ([#482](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/482))
* `FIX`: don't use browser defaults for undo/redo ([#483](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/483))
* `DEPS`: bump to `diagram-js@7.5.0`
* `DEPS`: bump to `bpmn-js@8.8.1`

## 0.45.0

* `FEAT`: allow configuring camunda forms ([#480](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/480))
* `DEPS`: update to camunda-bpmn-moddle@6.1.0

## 0.44.1

* `DEPS`: update to `diagram-js@7.4.0` ([#479](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/479))

## 0.44.0

* `FEAT`: allow independent configuration of variables and local in `camunda:in|out` element template bindings ([`5e5b2d6f`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/5e5b2d6f7a45fda4d46909ba21a52a66c12d6451))
* `DEPS`: update to `element-templates-validator@0.2.0`
* `DEPS`: update to `bpmn-js@8.7.1`

## 0.43.1

* `FIX`: preserve Windows newline character ([#471](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/471))
* `DEPS`: update to `bpmn-js@8.7.0` and `bpmn-moddle@7.1.1`

## 0.43.0

* `FEAT`: update existing documentation entries ([#465](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/465))
* `FIX`: open and close properties when working as web component ([#458](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/458))
* `FIX`: give properties table inputs a unique identifier ([#407](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/407))
* `DEPS`: bump to `bpmn-js@8.5.0` and `diagram-js@7.3.0`

## 0.42.0

* `FEAT`: support templating of `camunda:ErrorEventDefinition` and global `bpmn:Error` elements ([#424](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/424), [#425](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/425), [#441](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/441))
* `FEAT`: validate element templates via JSON Schema ([#455](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/455))
* `FIX`: ensure necessary part of variable title is always displayed ([`452f4488`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/452f4488d2a65db858f6e67f4684e8c413af0ad5))
* `FIX`: use pre-compiled element templates validator ([#462](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/462))
* `CHORE`: make extension elements helper always return an array ([#447](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/447))
* `CHORE`: bump to `bpmn-js@8.3.0`

### Breaking Changes

* `ExtensionElementsHelper#getExtensionElements` now returns an empty array if no extension element of the requested type was found, instead of returning `undefined`.  This means the return value is now always _truthy_.

## 0.41.0

* `FEAT`: support multiple properties panel providers ([#438](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/438))
* `FEAT`: validate element template schema version provided as part `$schema` attribute and ignore unsupported versions ([#2083](https://github.com/camunda/camunda-modeler/issues/2083))
* `FEAT`: provided clearer labels for `bpmn:*EventDefinitions` ([#421](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/421))
* `FEAT`: support error event definitions for external service tasks ([#422](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/422))
* `FEAT`: support new element templates scope descriptors ([#423](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/423))
* `FIX`: don't render `version` in element template view, when applied element template has no `version` ([#2101](https://github.com/camunda/camunda-modeler/issues/2101))
* `FIX`: always provide `id` and `name` of an element template when logging an error ([#2111](https://github.com/camunda/camunda-modeler/issues/2111))
* `CHORE`: bump to `@bpmn-io/extract-process-variables@0.4.1`
* `CHORE`: bump to `bpmn-js@8.2.1`

## 0.40.0

* `CHORE`: bump to `@bpmn-io/extract-process-variables@0.4.0`
* `CHORE`: bump to `bpmn-js@8.2.0`
* `CHORE`: bump to `bpmn-moddle@7.0.4`

## 0.39.0

* `FEAT`: add 'Participant' prefix to properties panel participant inputs for clarity ([#413](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/413))
* `CHORE`: bump to `bpmn-js@8.1.0`
* `CHORE`: bump to `diagram-js@7.0.0`

### Breaking Changes

* Participant input `data-entry` html attribute was changed from `id` to `participant-id`

## 0.38.1

* `FIX`: fix displayed template version ([#408](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/408), [#409](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/409))

## 0.38.0

* `FEAT`: allow updating templates ([#399](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/399))
* `FEAT`: recognize template versions ([#398](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/398))
* `FEAT`: prevent changing template before the current one is unlinked or removed ([#398](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/398))
* `FIX`: stop using variable name as id ([#405](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/405))
* `CHORE`: update `camunda-bpmn-moddle` to v4.5.0 ([`f8ed2081`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/f8ed2081538b0d604ad7fc1a5949ab00ec0c109a))

### Breaking Changes

* Element template select is no longer visible when an element template is applied. Unlink or remove the template to be able to apply another one ([#398](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/398)).
* `getDefaultTemplate` helper has been removed. Use `ElementTemplates#getDefault` instead ([#398](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/398)).

## 0.37.6

* `FIX`: escape element template not found description ([#397](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/397))
* `FIX`: correctly use an idPrefix to determine scriptType of i/o parameter in all cases ([`aa287d54`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/aa287d54e1626190b942030d6f256e938875bfe0))
* `CHORE`: remove `bpmn-font` dependency

## 0.37.5

* `FIX`: unlink template on replace
* `FIX`: correct removal of event template

## 0.37.4

* `FIX`: correctly write `camunda:variableEvents` event ([#355](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/355))

## 0.37.3

* `FIX`: re-enable `entriesVisible` ([#389](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/389))

## 0.37.2

* `FIX`: render validation error below checkbox labels ([#359](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/359))

## 0.37.1

* `FIX`: ensure undo and redo is working for template parameters ([#380](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/380))

## 0.37.0

* `FEAT`: add toggle switch entry factory ([`51dd639c`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/51dd639c3f278f3c0cb2d089bd3ac305d61e4e7c))
* `FEAT`: add template parameter toggle ([#365](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/365))
* `FEAT`: crop descriptions ([#369](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/369))
* `FIX`: prevent hiding group headers ([#373](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/373))
* `CHORE`: update process variables overview description ([`f32e424b`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/f32e424b5aea4ab2dd77f525c555c2959b4207da))
* `CHORE`: bump to `diagram-js@6.7.1`

### Breaking Changes

* all factories now return DOM instead of string ([#370](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/370))
* API of all factories has changed and now requires `translate` as first parameter ([#370](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/370))

## 0.36.0

* `FEAT`: add new input and output parameter editing as default to _Tempate_ tab ([#363](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/363))
* `FEAT`: add `Template` tab ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))
* `FEAT`: add new input and output parameter editing to _Input/Output_ tab
* `FEAT`: add auto suggest for editing input and output parameters ([#357](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/357))
* `FEAT`: add _Variables_ tab ([#347](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/347))
* `CHORE`: bump to `bpmn-js@7.3.0`

### Breaking Changes

* change parameters of `CamundaPropertiesProvider` ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))
* remove `entriesVisible` property to disallow chaning visibility of entries outside of element templates tab ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))
* `button` elements will not be styled by default anymore, instead, they will be styled using the `action-button` class ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))
* `propertiesPanel.isEntryVisible` event fired with `element`, `entry`, `group` and `tab` ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))
* PropertiesActivator#isEntryVisible called with `element`, `entry`, `group` and `tab` (e.g. `propertiesActivator.isEntryVisible(element, entry, group, tab)`) ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))
* `propertiesPanel.isPropertyEditable` event fired with `element`, `entry`, `group` and `tab` ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))
* PropertiesActivator#isEntryEditable called with `element`, `entry`, `group`, `propertyName` and `tab` (e.g. `propertiesActivator.isEntryEditable(propertyName, element, entry, group, tab)`) ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))

## 0.35.0

* `FEAT`: align colors with Camunda Modeler ([`10892b18e`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/10892b18efef14a426ddcd6d3ec4e4a254171afa))

## 0.34.0

* `CHORE`: add promise polyfill for phantom-js ([`e9d5969f`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/e9d5969f141e1424a3026fc32f2a380e40507118))
* `FEAT`: add variable name hint for form field ids ([`f0d04332`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/f0d0433291e9049062aee17b67a179bb3bcdfeb5))
* `FEAT`: add tooltip support for dropdown options ([`2aa74ee8`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/2aa74ee82781260844e27e5f7fffbba6cb02ad5d))
* `CHORE`: bump to `bpmn-js@7.2.0`
* `CHORE`: update bpmn-js peer dependency range with `^7x`

## 0.33.2

* `FIX`: paste always as plain text ([#265](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/265))

## 0.33.1

* `FIX`: deprecate placeholders ([`257d0c1f`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/257d0c1f528cf68a08e214f10ec82925314be48e))

## 0.33.0

* `FEAT`: support `update` events for task listeners ([`775fae0d`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/775fae0d41cfaf518948b7a5ab8806af034ba1e0))
* `FEAT`: support `timeout` events for task listeners ([`eb3bcde7`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/eb3bcde72c8cc2afed3515a4ef9ab5302067b9e5))
* `CHORE`: update `bpmn-js` peer dependency range with `^5.x || ^6.x`

## 0.32.2

* `FIX`: support line breaks in Entry Field Description ([#319](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/319))

## 0.32.1

* `FIX`: don't allow editing of `camunda:InputOutput` on gateways ([#314](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/314))

## 0.32.0

* `FEAT`: support `camunda:errorMessage` ([#313](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/313))
* `CHORE`: move camunda related error properties to correct provider ([`957beb`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/957bebf77b5307a9539f67d15aae3996dd63c080))

## 0.31.0

* `FEAT`: sanitize entities when building HTML ([#296](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/296))
* `FEAT`: support name editing for `bpmn:Group`
* `FEAT`: improve text annotation label
* `FEAT`: translate error messages
* `FIX`: remove accidential whitespace ([`180ba5b9`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/180ba5b9e88adb1d9d1b9bfbd10536fcb2d62709))
* `CHORE`: update `bpmn-js` peer dependency range to `^3.x || ^4.x`

## 0.30.0

* `FEAT`: improve localization ([#295](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/295))
* `FEAT`: add hint about task definition key in user task ([#294](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/294))

## 0.29.0

* `FEAT`: add hints to returned Java types ([#286](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/286))
* `FEAT`: show target variable name instead of index ([#287](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/287))

## 0.28.2

* `CHORE`: update to `npm-run-all@4.1.5`

## 0.28.1

* `FIX`: handle correct `camunda:isStartableInTasklist` default value

## 0.28.0

* `FEAT`: support `camunda:isStartableInTasklist` ([#284](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/284))
* `FIX`: don't restrict properties panel height unnecessarily ([#283](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/283))

## 0.27.0

* `CHORE`: `bpmn-js@3` compatibility

## 0.26.0

* `FEAT`: provide pre-built styles
* `CHORE`: bump dependency versions
* `CHORE`: migrate to `lodash@4`

## 0.25.2

* `FIX`: correct variable mapping not removing target props

## 0.25.1

* `FIX`: handle delete key strokes in `selects`

## 0.25.0

* `CHORE`: revert [`6c757170`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/6c757170d76996da311c758c5923a530d86ba7f3), as it disabled certain [usage scenarios](https://github.com/camunda/camunda-modeler/issues/792)

## 0.24.1

* `FIX`: show description for select entries

## 0.24.0

* `FEAT`: binding of business rule tasks and call activities can be set to version tag [`10738e92`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/10738e927fdb297fc9042e8103fb4fde60ae7264)
* `FEAT`: validate source and target of of variables [`dd163e66`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/dd163e6674454288cb48aa5592fac608544b8cb6)
* `FEAT`: selecting label of an element will show all element properties in properties panel [`40935240`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/40935240b4ef01bfd435f7c20d594cbea1976832)
* `FEAT`: condition of conditional events can be set to script [`c38f90bd`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/c38f90bd5a77490f20bba52884f97e26a55f4f31)
* `FIX`: form data is removed when empty [`481b5c1f`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/481b5c1f6b1fac2e23e204050ca0ec097d4914eb)
* `FEAT`: business key expression of camunda ins can be edited [`3f1d780f`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/3f1d780fc84d3f69a3528c3b800fa4b16d7ce95e)
* `FIX`: timer definition type of intermediate catching events can't be set to cycle [`6c757170`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/6c757170d76996da311c758c5923a530d86ba7f3)
* `FEAT`: candidate starter users and groups of processes can be edited [`c1d51285`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/c1d512854f070c0af345f730fa005acdfa539635)
* `FEAT`: variables of signal events can be edited [`aba8287e`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/aba8287ea5645d0c7db974422e68be6b852257a4)
* `FEAT`: condition and variable name of conditional start events can be edited [`9cc1d6c5`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/9cc1d6c5ef6a9cd45b292ed7749b7bfc967bc145)

## ...

Check `git log` for earlier history.
