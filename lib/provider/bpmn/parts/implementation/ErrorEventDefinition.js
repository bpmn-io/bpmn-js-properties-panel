'use strict';

var domQuery = require('min-dom/lib/query'),
    entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    forEach = require('lodash/collection/forEach'),
    domAttr = require('min-dom/lib/attr'),
    elementHelper = require('../../../../helper/ElementHelper'),
    domify = require('min-dom/lib/domify'),

    utils = require('../../../../Utils');


function ErrorEventDefinition(group, element, bpmnFactory, errorEventDefinition, showErrorCodeVariable) {
  group.entries.push({
    'id': 'errorDefinition',
    'description': 'Configure the error element',
    label: 'Errors',
    'html': '<div class="pp-row pp-select">' +
              '<label for="camunda-errors">Errors</label>' +
              '<div class="pp-field-wrapper">' +
                '<select id="camunda-errors" name="errors" data-value>' +
                '</select>' +
                '<button class="add" id="addError" data-action="addError"><span>+</span></button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row pp-textfield" data-show=isErrorCodeSelected>' +
              '<label for="cam-error-name">Error Name</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="cam-error-name" type="text" name="errorName" />' +
                '<button class="clear" data-action="clearErrorName" data-show="canClearErrorName">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row pp-textfield" data-show=isErrorCodeSelected>' +
              '<label for="cam-error-code">Error Code</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="cam-error-code" type="text" name="errorCode" />' +
                '<button class="clear" data-action="clearErrorCode" data-show="canClearErrorCode">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>',

    addError: function(element, inputNode) {
      var update = {};

      // create new empty error
      var newError = elementHelper.createElement('bpmn:Error', {}, utils.getRoot(errorEventDefinition), bpmnFactory);
      var optionTemplate = domify('<option value="' + newError.id + '"> (id='+newError.id+')' + '</option>');

      var existingErrors = domQuery('select[name=errors]', inputNode.parentElement);
      // add new option
      existingErrors.insertBefore(optionTemplate, existingErrors.firstChild);
      // select new error in the error select box
      forEach(existingErrors, function(error) {
        if (error.value === newError.id) {
          domAttr(error, 'selected', 'selected');
        } else {
          domAttr(error, 'selected', null);
        }
      });

      update.errors = newError.id;
      update.errorName = '';

      return update;
    },

    get: function(element, entryNode) {
      var values = {};

      // fill error select box with options
      utils.updateOptionsDropDown('select[name=errors]', errorEventDefinition, 'bpmn:Error', entryNode);

      var boError = errorEventDefinition.get('errorRef');
      if (boError) {
        values.errors = boError.id;
        values.errorName = boError.get('name');
        values.errorCode = boError.get('errorCode');
      } else {
        values.errors = '';
      }

      return values;
    },
    set: function(element, values) {
      var selectedError = values.errors;
      var errorName = values.errorName;
      var errorCode = values.errorCode;
      var errorExist = false;
      var update = {
        errorCode: undefined
      };

      var errors = utils.findRootElementsByType(errorEventDefinition, 'bpmn:Error');
      forEach(errors, function(error) {
        if (error.id === values.errors) {
          errorExist = true;
        }
      });

      if (selectedError && !errorExist) {
        // create and reference new element
        return {
          cmd: 'properties-panel.create-and-reference',
          context: {
            element: element,
            referencingObject: errorEventDefinition,
            referenceProperty: 'errorRef',
            newObject: { type: 'bpmn:Error', properties: { name: selectedError } },
            newObjectContainer: utils.getRoot(errorEventDefinition).rootElements,
            newObjectParent: utils.getRoot(errorEventDefinition)
          }
        };
      }

      // update error business object
      var boError = errorEventDefinition.get('errorRef');
      if (boError && ((boError.name != errorName) || (boError.errorCode != errorCode))) {
          update.name = errorName;
          if (errorCode !== '') {
            update.errorCode = errorCode;
          }

         return cmdHelper.updateBusinessObject(element, boError, update);

      } else {

        // update or clear reference on business object
        update.errorRef = selectedError;

        return {
          cmd:'properties-panel.update-businessobject',
          context: {
            element: element,
            businessObject: errorEventDefinition,
            referenceType: 'bpmn:Error',
            referenceProperty: 'errorRef',
            properties: update
          }
        };
      }

    },
    validate: function(element, values) {
      var errorName = values.errorName;

      var validationResult = {};

      // can be undefined (which is fine)
      if(errorName === '') {
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
      var errorComboBox = domQuery('select[name=errors]', node.parentElement);
      if (errorComboBox.value && errorComboBox.value.length > 0)  {
        return true;
      } else {
        return false;
      }
    },

    cssClasses: ['pp-event-definition']
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

        if (values.errorCodeVariable !== '') {
          update['camunda:errorCodeVariable'] = values.errorCodeVariable;
        }

        return cmdHelper.updateBusinessObject(element, errorEventDefinition, update);
      }
    }));
  }
}

module.exports = ErrorEventDefinition;
