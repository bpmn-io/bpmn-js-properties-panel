'use strict';

var domQuery = require('min-dom/lib/query'),
    utils = require('../../../../Utils');


module.exports = {
  template:
    '<div class="pp-row">' +
      '<label for="camunda-case-ref">Case Ref</label>' +
      '<div class="pp-field-wrapper">' +
        '<input id="camunda-case-ref" type="text" name="caseRef" />' +
        '<button class="clear" data-action="caseRef.clearCaseRef" data-show="caseRef.canClearCaseRef">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    '<div class="pp-row">' +
      '<label for="cam-case-binding">Case Binding</label>' +
      '<div class="pp-field-wrapper">' +
        '<select id="cam-case-binding" name="caseBinding" data-value>' +
          '<option value="latest" selected>latest</option>' + // default value
          '<option value="deployment">deployment</option>' +
          '<option value="version">version</option>' +
        '</select>' +
      '</div>' +
    '</div>' +

    '<div class="pp-row" data-show="caseRef.isCaseVersion">' +
      '<label for="cam-case-version">Case Version</label>' +
      '<div class="pp-field-wrapper">' +
        '<input id="cam-case-version" type="text" name="caseVersion" />' +
        '<button class="clear" data-action="caseRef.clearVersion" data-show="caseRef.canClearVersion">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>',

    get: function(callActivityType, callActivityValue, update, bo) {
      var boCaseBinding = bo.get('camunda:caseBinding'),
        boCaseVersion = bo.get('camunda:caseVersion');

      update.caseRef = callActivityValue;
      // use also the defaut value 'latest' when called element binding is undefined
      update.caseBinding = boCaseBinding || 'latest';

      if (typeof boCaseVersion !== 'undefined' && boCaseBinding === 'version') {
        update.caseVersion = boCaseVersion;
      }
    },
    setEmpty: function(update) {
      update['camunda:caseRef'] = undefined;
      update['camunda:caseBinding'] = undefined;
      update['camunda:caseVersion'] = undefined;
    },
    set: function(values, update) {
      var caseRef = values.caseRef,
          caseBinding = values.caseBinding,
          caseVersion = values.caseVersion;

      update['camunda:caseRef'] = caseRef || '';

      update['camunda:caseBinding'] = caseBinding;

      if (caseBinding === 'version') {
        update['camunda:caseVersion'] = caseVersion || '';
      }
    },
    validate: function(values, validationResult) {
      var caseRefValue = values.caseRef,
        caseBinding = values.caseBinding,
        caseVersion = values.caseVersion;

      if(!caseRefValue) {
        validationResult.caseRef = 'Value must provide a value.';
      }

      if(!caseVersion && caseBinding === 'version') {
        validationResult.caseVersion = 'Value must provide a value.';
      }
    },
    isCaseVersion: function(element, node) {
      var binding = utils.selectedType('select[name=caseBinding]', node.parentElement);

      return binding === 'version';
    },
    clearCaseRef: function(element, inputNode) {
      // clear text input
      domQuery('input[name=caseRef]', inputNode).value='';

      return true;
    },
    canClearCaseRef: function(element, inputNode) {
      var input = domQuery('input[name=caseRef]', inputNode);

      return input.value !== '';
    },
    clearVersion: function(element, inputNode) {
      // clear text input
      domQuery('input[name=caseVersion]', inputNode).value='';

      return true;
    },
    canClearVersion: function(element, inputNode) {
      var input = domQuery('input[name=caseVersion]', inputNode);

      return input.value !== '';
    }
};
