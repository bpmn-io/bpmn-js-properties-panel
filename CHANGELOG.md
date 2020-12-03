# Changelog

All notable changes to [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

...

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
