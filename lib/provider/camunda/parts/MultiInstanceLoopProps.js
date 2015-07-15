'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  propertyEntryFactory = require('../../../PropertyEntryFactory'),
  elementCreationHelper = require('../../../helper/ElementCreationHelper');

var forEach = require('lodash/collection/forEach');

module.exports = function(group, element, bpmnFactory) {
  var businessObject = getBusinessObject(element);
  if(is(businessObject.loopCharacteristics, 'camunda:Collectable')) {

    var modifyBusinessObject = function(element, property, values) {
      var businessObject = getBusinessObject(element).get('loopCharacteristics');

      // create new entry (or overwriting old one)
      var entry = {};
      if(values[property] !== '' && values[property] !== undefined) {
        entry[property] = elementCreationHelper
          .createElement('bpmn:FormalExpression', {body: values[property]}, businessObject, bpmnFactory);
      } else {
        // removes the element
        entry[property] = undefined;
      }

      return {
        cmd:'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: entry
        }
      };
    };

    var get = function(element, property) {
      var loopCharacteristics = businessObject.get('loopCharacteristics'),
          res = {};

      res[property] = loopCharacteristics.get(property).body;
      return res;
    };

    group.entries.push(propertyEntryFactory.textField({
      id: 'loopCardinality',
      description: '',
      label: 'Loop Cardinality',
      modelProperty: 'loopCardinality',
      set: function(element, values) {
        return modifyBusinessObject(getBusinessObject(element), 'loopCardinality', values);
      },
      get: function(element) {
        return get(element, 'loopCardinality')
      }
    }));

    group.entries.push(propertyEntryFactory.textField({
      id: 'completionCondition',
      description: '',
      label: 'Completion Condition',
      modelProperty: 'completionCondition',
      set: function(element, values) {
        return modifyBusinessObject(getBusinessObject(element), 'completionCondition', values);
      },
      get: function(element) {
        return get(element, 'completionCondition')
      }
    }));

    group.entries.push(propertyEntryFactory.textField({
      id: 'collection',
      description: '',
      label: 'Collection',
      modelProperty: 'collection',
      set: function(element, values) {
        var businessObject = getBusinessObject(element).get('loopCharacteristics');

        return {
          cmd:'properties-panel.update-businessobject',
          context: {
            element: element,
            businessObject: businessObject,
            properties: { collection: values['collection']}
          }
        };
      },
      get: function(element) {
        var bo = getBusinessObject(element).get('loopCharacteristics');

        return { collection: bo.get('collection')}
      }
    }));

    // AsyncBefore
    group.entries.push(propertyEntryFactory.checkbox({
      id: 'loopAsyncBefore',
      description: '',
      label: 'Multi Instance Asynchronous Before',
      modelProperty: 'loopAsyncBefore',
      get: function(element) {
        var bo = getBusinessObject(element).get('loopCharacteristics');
        return { loopAsyncBefore: bo.get('asyncBefore')}
      },
      set: function(element, values) {
        var businessObject = getBusinessObject(element).get('loopCharacteristics');

        return {
          cmd: 'properties-panel.update-businessobject',
          context: {
            element: element,
            businessObject: businessObject,
            properties: {asyncBefore: values.loopAsyncBefore}
          }
        }
      }
    }));

    // AsyncAfter
    group.entries.push(propertyEntryFactory.checkbox({
      id: 'loopAsyncAfter',
      description: '',
      label: 'Multi Instance Asynchronous After',
      modelProperty: 'loopAsyncAfter',
      get: function(element) {
        var bo = getBusinessObject(element).get('loopCharacteristics');
        return { loopAsyncAfter: bo.get('asyncAfter')}
      },
      set: function(element, values) {
        var businessObject = getBusinessObject(element).get('loopCharacteristics');

        return {
          cmd:'properties-panel.update-businessobject',
          context: {
            element: element,
            businessObject: businessObject,
            properties: { asyncAfter: values.loopAsyncAfter }
          }
        };
      }
    }));
  }
};