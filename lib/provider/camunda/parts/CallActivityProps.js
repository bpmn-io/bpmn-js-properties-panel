'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
  forEach = require('lodash/collection/forEach');


module.exports = function(group, element) {
  var bo;

  if (is(element, 'camunda:Calling')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push({
    'id': 'callActivity',
    'description': 'Configure the Call Activity properties.',
    label: 'CallActivity',
    'html':'<div class="field-wrapper">' +
              '<label for="camunda-calledElement">Called Element</label>' +
              '</br>' +
              '<input id="camunda-calledElement" type="text" name="calledElement" />' +
              '<button data-action="clear" data-show="canClear">' +
                '<span>X</span>' +
              '</button>' +
            '</div>' +

            '<br/>' +

            '<label for="cam-called-element-binding">Called Element Binding</label>' +
            '<div class="field-wrapper">' +
              '<select id="cam-called-element-binding" name="calledElementBinding">' +
                '<option value="latest">latest</option>' + // default value
                '<option value="deployment">deployment</option>' +
                '<option value="version">version</option>' +
              '</select>' +
            '</div>' +

            '<div class="field-wrapper" data-show="isVersion">' +
              '</br>' +
              '<label for="cam-called-element-version">Called Element Version</label>' +
              '</br>' +
              '<input id="cam-called-element-version" type="text" name="calledElementVersion" />' +
              '<button data-action="versionClear" data-show="versionCanClear">' +
                '<span>X</span>' +
              '</button>' +
            '</div>',

    get: function (element, propertyName) {
      // read values from xml:
      var boCalledElement = bo.get('calledElement'),
          boCalledElementBinding = bo.get('camunda:calledElementBinding'),
          boCalledElementVersion = bo.get('camunda:calledElementVersion');

      var update = {};

      update.calledElement = boCalledElement;
      update.calledElementBinding = boCalledElementBinding;

      if (!!boCalledElementVersion && boCalledElementBinding === 'version') {
        update.calledElementVersion = boCalledElementVersion;
      }

      var options = domQuery.all('select[name="calledElementBinding"] > option');
      // set select box value
      forEach(options, function(option) {
        if(option.value === boCalledElementBinding) {
          domAttr(option, 'selected', 'selected');
        } else {
          domAttr(option, 'selected', null);
        }
      });

      return update;
    },
    set: function(element, values) {
      var calledElement = values.calledElement,
        calledElementBinding = values.calledElementBinding,
        calledElementVersion = values.calledElementVersion;

      var update = {
        "calledElement" : undefined,
        "camunda:calledElementBinding" : undefined,
        "camunda:calledElementVersion" : undefined
      };

      update.calledElement = calledElement;
      update['camunda:calledElementBinding'] = calledElementBinding;

      if (!!calledElementVersion && calledElementBinding === 'version') {
        update['camunda:calledElementVersion'] = calledElementVersion;
      }

      return update;

    },
    validate: function(element, values) {
      var calledElementValue = values.calledElement,
        calledElementBinding = values.calledElementBinding,
        calledElementVersion = values.calledElementVersion;

      var validationResult = {};

      if(!calledElementValue) {
        validationResult.calledElement = "Value must provide a value.";
      }

      if(!calledElementVersion && calledElementBinding === 'version') {
        validationResult.calledElementVersion = "Value must provide a value.";
      }

      return validationResult;
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
    isVersion: function(element, node) {
      var elementBinding = domQuery('select[name=calledElementBinding] > option:checked', node.parentElement);

      if(elementBinding === null) {
        elementBinding = domQuery('select[name=calledElementBinding] > option[selected=selected]', node.parentElement);
      }

      return elementBinding.value === 'version';
    },
    versionClear: function(element, inputNode) {
      // clear text input
      domQuery('input[name=calledElementVersion]', inputNode).value='';

      return true;
    },
    versionCanClear: function(element, inputNode) {
      var input = domQuery('input[name=calledElementVersion]', inputNode);

      return input.value !== '';
    },
  });
};