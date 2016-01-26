'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  utils = require('../../../Utils'),

  calledElement = require('./implementation/CalledElement'),
  caseRef = require('./implementation/CaseRef');


function getCallActivityType(node) {
  return utils.selectedType('select[name=callActivityType]', node.parentElement);
}


module.exports = function(group, element) {
  var bo;

  if (is(element, 'camunda:CallActivity')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push({
    'id': 'callActivity',
    'description': 'Configure the Call Activity properties.',
    label: 'CallActivity',
    'html': '<div class="pp-row">' +
              '<label for="cam-call-activity-type">CallActivity Type</label>' +
              '<div class="pp-field-wrapper">' +
                '<select id="cam-call-activity-type" name="callActivityType" data-value>' +
                  '<option value="bpmn">BPMN</option>' +
                  '<option value="cmmn">CMMN</option>' +
                  '<option value="" selected></option>' +
                '</select>' +
              '</div>' +
            '</div>' +

            '<div data-show="isBPMN">' + calledElement.template + '</div>' +

            '<div data-show="isCMMN">' + caseRef.template + '</div>',

    get: function (element, propertyName) {
      var boCalledElement = bo.get('calledElement'),
          boCaseRef = bo.get('camunda:caseRef');

      var update = {},
          callActivityType = '';

      if (typeof boCalledElement !== 'undefined') {
        callActivityType = 'bpmn';
        calledElement.get(callActivityType, boCalledElement, update, bo);
      } else

      if (typeof boCaseRef !== 'undefined') {
        callActivityType = 'cmmn';
        caseRef.get(callActivityType, boCaseRef, update, bo);
      }

      update.callActivityType = callActivityType;

      return update;
    },
    set: function(element, values) {
      var callActivityType = values.callActivityType,
        update = {};

      calledElement.setEmpty(update);
      caseRef.setEmpty(update);

      if (callActivityType) {
        if (callActivityType === 'bpmn') {
          calledElement.set(values, update);
        } else

        if (callActivityType === 'cmmn') {
          caseRef.set(values, update);
        }
      }

      return update;
    },
    validate: function(element, values) {
      var callActivityType = values.callActivityType,
        validationResult = {};

      if (callActivityType) {
        if (callActivityType === 'bpmn') {
          calledElement.validate(values, validationResult);
        } else

        if (callActivityType === 'cmmn') {
          caseRef.validate(values, validationResult);
        }
      }

      return validationResult;
    },
    isBPMN: function(element, node) {
      var callActivityType = getCallActivityType(node);

      return callActivityType === 'bpmn';
    },
    isCMMN: function(element, node) {
      var callActivityType = getCallActivityType(node);

      return callActivityType === 'cmmn';
    },

    calledElement : calledElement,
    caseRef : caseRef,

    cssClasses: ['pp-textfield']
  });
};
