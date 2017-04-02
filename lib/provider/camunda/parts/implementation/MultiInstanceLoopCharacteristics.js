'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var entryFactory = require('../../../../factory/EntryFactory');

var elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper');

var domClasses = require('min-dom/lib/classes');

/**
 * Get a property value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 *
 * @return {any} the property value
 */
function getProperty(element, propertyName) {
  var loopCharacteristics = getLoopCharacteristics(element);
  return loopCharacteristics && loopCharacteristics.get(propertyName);
}

/**
 * Get the body of a given expression.
 *
 * @param {ModdleElement<bpmn:FormalExpression>} expression
 *
 * @return {string} the body (value) of the expression
 */
function getBody(expression) {
  return expression && expression.get('body');
}


/**
 * Get the loop characteristics of an element.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:MultiInstanceLoopCharacteristics>} the loop characteristics
 */
function getLoopCharacteristics(element) {
  var bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}

/**
 * Get the loop cardinality of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the loop cardinality
 */
function getLoopCardinality(element) {
  return getProperty(element, 'loopCardinality');
}

/**
 * Get the loop cardinality value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the loop cardinality value
 */
function getLoopCardinalityValue(element) {
  var loopCardinality = getLoopCardinality(element);
  return getBody(loopCardinality);
}

/**
 * Get the completion condition of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the completion condition
 */
function getCompletionCondition(element) {
  return getProperty(element, 'completionCondition');
}

/**
 * Get the completion condition value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the completion condition value
 */
function getCompletionConditionValue(element) {
  var completionCondition = getCompletionCondition(element);
  return getBody(completionCondition);
}

/**
 * Get the 'camunda:collection' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'camunda:collection' value
 */
function getCollection(element) {
  return getProperty(element, 'camunda:collection');
}

/**
 * Get the 'camunda:elementVariable' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'camunda:elementVariable' value
 */
function getElementVariable(element) {
  return getProperty(element, 'camunda:elementVariable');
}


/**
 * Creates 'bpmn:FormalExpression' element.
 *
 * @param {ModdleElement} parent
 * @param {string} body
 * @param {BpmnFactory} bpmnFactory
 *
 * @result {ModdleElement<bpmn:FormalExpression>} a formal expression
 */
function createFormalExpression(parent, body, bpmnFactory) {
  return elementHelper.createElement('bpmn:FormalExpression', { body: body }, parent, bpmnFactory);
}

/**
 * Updates a specific formal expression of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 * @param {string} newValue
 * @param {BpmnFactory} bpmnFactory
 */
function updateFormalExpression(element, propertyName, newValue, bpmnFactory) {
  var loopCharacteristics = getLoopCharacteristics(element);

  var expressionProps = {};

  if (!newValue) {
    // remove formal expression
    expressionProps[propertyName] = undefined;
    return cmdHelper.updateBusinessObject(element, loopCharacteristics, expressionProps);
  }

  var existingExpression = loopCharacteristics.get(propertyName);

  if (!existingExpression) {
    // add formal expression
    expressionProps[propertyName] = createFormalExpression(loopCharacteristics, newValue, bpmnFactory);
    return cmdHelper.updateBusinessObject(element, loopCharacteristics, expressionProps);
  }

  // edit existing formal expression
  return cmdHelper.updateBusinessObject(element, existingExpression, {
    body: newValue
  });
}


module.exports = function(element, bpmnFactory, translate) {

  var entries = [];

  // error message /////////////////////////////////////////////////////////////////

  entries.push({
    id: 'multiInstance-errorMessage',
    html: '<div data-show="isValid">' +
             '<span class="bpp-icon-warning"></span> ' +
             translate('Must provide either loop cardinality or collection') +
          '</div>',

    isValid: function(element, node, notification, scope) {
      var loopCharacteristics = getLoopCharacteristics(element);

      var isValid = true;
      if (loopCharacteristics) {
        var loopCardinality = getLoopCardinalityValue(element);
        var collection = getCollection(element);

        isValid = !loopCardinality && !collection;
      }

      domClasses(node).toggle('bpp-hidden', !isValid);
      domClasses(notification).toggle('bpp-error-message', isValid);

      return isValid;
    }
  });

  // loop cardinality //////////////////////////////////////////////////////////////

  entries.push(entryFactory.textField({
    id: 'multiInstance-loopCardinality',
    label: translate('Loop Cardinality'),
    modelProperty: 'loopCardinality',

    get: function(element, node) {
      return {
        loopCardinality: getLoopCardinalityValue(element)
      };
    },

    set: function(element, values) {
      return updateFormalExpression(element, 'loopCardinality', values.loopCardinality, bpmnFactory);
    }
  }));


  // collection //////////////////////////////////////////////////////////////////

  entries.push(entryFactory.textField({
    id: 'multiInstance-collection',
    label: translate('Collection'),
    modelProperty: 'collection',

    get: function(element, node) {
      return {
        collection: getCollection(element)
      };
    },

    set: function(element, values) {
      var loopCharacteristics = getLoopCharacteristics(element);
      return cmdHelper.updateBusinessObject(element, loopCharacteristics, {
        'camunda:collection': values.collection || undefined
      });
    },

    validate: function(element, values, node) {
      var collection = getCollection(element);
      var elementVariable = getElementVariable(element);

      if (!collection && elementVariable) {
        return { collection : 'Must provide a value' };
      }
    }
  }));


  // element variable ////////////////////////////////////////////////////////////

  entries.push(entryFactory.textField({
    id: 'multiInstance-elementVariable',
    label: translate('Element Variable'),
    modelProperty: 'elementVariable',

    get: function(element, node) {
      return {
        elementVariable: getElementVariable(element)
      };
    },

    set: function(element, values) {
      var loopCharacteristics = getLoopCharacteristics(element);
      return cmdHelper.updateBusinessObject(element, loopCharacteristics, {
        'camunda:elementVariable': values.elementVariable || undefined
      });
    }
  }));


  // Completion Condition //////////////////////////////////////////////////////

  entries.push(entryFactory.textField({
    id: 'multiInstance-completionCondition',
    label: translate('Completion Condition'),
    modelProperty: 'completionCondition',

    get: function(element) {
      return {
        completionCondition: getCompletionConditionValue(element)
      };
    },

    set: function(element, values) {
      return updateFormalExpression(element, 'completionCondition', values.completionCondition, bpmnFactory);
    }
  }));

  return entries;

};
