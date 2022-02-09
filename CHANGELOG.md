# Changelog

All notable changes to [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

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

### BREAKING CHANGES

* Participant input `data-entry` html attribute was changed from `id` to `participant-id`

## 0.38.1

* `FIX`: fix displayed template version ([#408](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/408), [#409](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/409))

## 0.38.0

* `FEAT`: allow updating templates ([#399](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/399))
* `FEAT`: recognize template versions ([#398](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/398))
* `FEAT`: prevent changing template before the current one is unlinked or removed ([#398](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/398))
* `FIX`: stop using variable name as id ([#405](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/405))
* `CHORE`: update `camunda-bpmn-moddle` to v4.5.0 ([`f8ed2081`](https://github.com/bpmn-io/bpmn-js-properties-panel/commit/f8ed2081538b0d604ad7fc1a5949ab00ec0c109a))

### BREAKING CHANGES

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

### BREAKING CHANGES

* all factories now return DOM instead of string ([#370](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/370))
* API of all factories has changed and now requires `translate` as first parameter ([#370](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/370))

## 0.36.0

* `FEAT`: add new input and output parameter editing as default to _Tempate_ tab ([#363](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/363))
* `FEAT`: add `Template` tab ([#364](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/364))
* `FEAT`: add new input and output parameter editing to _Input/Output_ tab
* `FEAT`: add auto suggest for editing input and output parameters ([#357](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/357))
* `FEAT`: add _Variables_ tab ([#347](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/347))
* `CHORE`: bump to `bpmn-js@7.3.0`

### BREAKING CHANGES

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
