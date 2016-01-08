'use strict';

var domQuery = require('min-dom/lib/query'),
    entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');


function ErrorEventDefinition(group, element, bpmnFactory, errorEventDefinition, showErrorCodeVariable) {
  group.entries.push(entryFactory.referenceCombobox({
    id: 'selectError',
    description: '',
    label: 'Error Definition',
    businessObject: errorEventDefinition,
    referencedType: 'bpmn:Error',
    referenceProperty: 'errorRef',
    referencedObjectToString: function(obj) {
      return obj.name + ' (id=' + obj.id + ')';
    }
  }));

  group.entries.push({
    'id': 'errorDefinition',
    'description': 'Configure the error element',
    label: 'Error Definition',
    'html': '<div class="pp-row" data-show=isErrorCodeSelected>' +
              '<label for="cam-error-name">Error Name</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="cam-error-name" type="text" name="errorName" />' +
                '<button class="clear" data-action="clearErrorName" data-show="canClearErrorName">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row" data-show=isErrorCodeSelected>' +
              '<label for="cam-error-code">Error Code</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="cam-error-code" type="text" name="errorCode" />' +
                '<button class="clear" data-action="clearErrorCode" data-show="canClearErrorCode">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>',

    get: function(element) {
      var values = {};

      var boError = errorEventDefinition.get('errorRef');
      if (!!boError) {
        values.errorCode = boError.get('errorCode');
        values.errorName = boError.get('name');
      }

      return values;
    },
    set: function(element, values) {
      var update = {
        'errorCode' : undefined
      };

      var boError = errorEventDefinition.get('errorRef');
      update.errorCode = values.errorCode;
      update.name = values.errorName;

      return cmdHelper.updateBusinessObject(element, boError, update);
    },
    validate: function(element, values) {
      var errorName = values.errorName;

      var validationResult = {};

      if(!errorName) {
        validationResult.errorName = 'Must provide a value.';
      }

      return validationResult;

    },
    clearErrorName: function(element, inputNode) {
      // clear text input
      domQuery('input[name=errorName]', inputNode).value='';

      return true;
    },
    canClearErrorName: function(element, inputNode) {
      var input = domQuery('input[name=errorName]', inputNode);

      return input.value !== '';
    },
    clearErrorCode: function(element, inputNode) {
      // clear text input
      domQuery('input[name=errorCode]', inputNode).value='';

      return true;
    },
    canClearErrorCode: function(element, inputNode) {
      var input = domQuery('input[name=errorCode]', inputNode);

      return input.value !== '';
    },
    isErrorCodeSelected: function(element, node) {
      var errorComboBox = domQuery('input[name=errorRef]', node.parentElement);
      if (errorComboBox.value) {
        return true;
      } else {
        return false;
      }
    },

    cssClasses: ['pp-textfield']
  });

  if (showErrorCodeVariable) {
    group.entries.push(entryFactory.textField({
      id : 'errorCodeVariable',
      description : '',
      label : 'Error Code Variable',
      modelProperty : 'errorCodeVariable',
      get: function(element) {
        var values = {};

        var boErrorCodeVariable = errorEventDefinition.get('camunda:errorCodeVariable');
        if (boErrorCodeVariable) {
          values.errorCodeVariable = boErrorCodeVariable;
        }

        return values;
      },
      set: function(element, values) {
        var update = {
          'camunda:errorCodeVariable' : undefined
        };

        update['camunda:errorCodeVariable'] = values.errorCodeVariable;

        return cmdHelper.updateBusinessObject(element, errorEventDefinition, update);
      }
    }));
  }
}

module.exports = ErrorEventDefinition;
