# Changelog

All notable changes to [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

# 1.18.0

* `FEAT`: support optional `zeebe:taskHeader` bindings ([#840](https://github.com/bpmn-io/bpmn-js-properties-panel/issues/840))
* `FEAT`: use `variablesResolver` service, when registered ([#881](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/881))
* `FIX`: evaluate conditional properties on `createElement` ([#878](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/878))

# 1.17.2

* `FIX`: don't apply default template during paste ([#877](https://github.com/bpmn-io/bpmn-js-properties-panel/pull/877))

# 1.17.1

* `DEPS`: update to `@bpmn-io/properties-panel@1.3.1`

# 1.17.0

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

### Breaking changes

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
