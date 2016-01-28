'use strict';

var domQuery = require('min-dom/lib/query'),
    utils = require('../../../../Utils');


module.exports = {
  template:
    '<div class="pp-row">' +
      '<label for="camunda-calledElement">Called Element</label>' +
      '<div class="pp-field-wrapper">' +
        '<input id="camunda-calledElement" type="text" name="calledElement" />' +
        '<button class="clear" data-action="calledElement.clear" data-show="calledElement.canClear">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    '<div class="pp-row">' +
      '<label for="cam-called-element-binding">Called Element Binding</label>' +
      '<div class="pp-field-wrapper">' +
        '<select id="cam-called-element-binding" name="calledElementBinding" data-value>' +
          '<option value="latest" selected>latest</option>' + // default value
          '<option value="deployment">deployment</option>' +
          '<option value="version">version</option>' +
        '</select>' +
      '</div>' +
    '</div>' +

    '<div class="pp-row" data-show="calledElement.isVersion">' +
      '<label for="cam-called-element-version">Called Element Version</label>' +
      '<div class="pp-field-wrapper">' +
        '<input id="cam-called-element-version" type="text" name="calledElementVersion" />' +
        '<button class="clear" data-action="calledElement.clearVersion" data-show="calledElement.canClearVersion">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>',

    get: function(callActivityType, callActivityValue, update, bo) {
      var boCalledElementBinding = bo.get('camunda:calledElementBinding'),
          boCalledElementVersion = bo.get('camunda:calledElementVersion');

      update.calledElement = callActivityValue;
      // use also the defaut value 'latest' when called element binding is undefined
      update.calledElementBinding = boCalledElementBinding || 'latest';

      if (typeof boCalledElementVersion !== 'undefined' && boCalledElementBinding === 'version') {
        update.calledElementVersion = boCalledElementVersion;
      }
    },
    setEmpty: function(update) {
      update.calledElement = undefined;
      update['camunda:calledElementBinding'] = undefined;
      update['camunda:calledElementVersion'] = undefined;
    },
    set: function(values, update) {
      var calledElement = values.calledElement,
          calledElementBinding = values.calledElementBinding,
          calledElementVersion = values.calledElementVersion;

      // if calledElement is undefined, set its value to an empty string
      update.calledElement = calledElement || '';

      update['camunda:calledElementBinding'] = calledElementBinding;

      if (calledElementBinding === 'version') {
        update['camunda:calledElementVersion'] = calledElementVersion || '';
      }
    },
    validate: function(values, validationResult) {
      var calledElementValue = values.calledElement,
        calledElementBinding = values.calledElementBinding,
        calledElementVersion = values.calledElementVersion;

      if(!calledElementValue) {
        validationResult.calledElement = 'Value must provide a value.';
      }

      if(!calledElementVersion && calledElementBinding === 'version') {
        validationResult.calledElementVersion = 'Value must provide a value.';
      }
    },
    isVersion: function(element, node) {
      var elementBinding = utils.selectedType('select[name=calledElementBinding]', node.parentNode);

      return elementBinding === 'version';
    },
    clear: function(element, inputNode) {
      // clear text input
      domQuery('input[name=calledElement]', inputNode).value='';

      return true;
    },
    canClear: function(element, inputNode) {
      var input = domQuery('input[name=calledElement]', inputNode);

      return input.value !== '';
    },
    clearVersion: function(element, inputNode) {
      // clear text input
      domQuery('input[name=calledElementVersion]', inputNode).value='';

      return true;
    },
    canClearVersion: function(element, inputNode) {
      var input = domQuery('input[name=calledElementVersion]', inputNode);

      return input.value !== '';
    }

};
