'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  entryFactory = require('../../../factory/EntryFactory'),
  elementHelper = require('../../../helper/ElementHelper'),
  cmdHelper = require('../../../helper/CmdHelper');

var forEach = require('lodash/collection/forEach');

module.exports = function(group, element, bpmnFactory) {
  var businessObject = getBusinessObject(element),
      asyncAfterButton,
      asyncBeforeButton;

  if(is(businessObject.loopCharacteristics, 'camunda:Collectable')) {

    var modifyBusinessObject = function(element, property, values) {
      var businessObject = getBusinessObject(element).get('loopCharacteristics');

      // create new entry (or overwriting old one)
      var properties = {};
      if(values[property] !== '' && values[property] !== undefined) {
        properties[property] = elementHelper
          .createElement('bpmn:FormalExpression', {body: values[property]}, businessObject, bpmnFactory);
      } else {
        // removes the element
        properties[property] = undefined;
      }

      return cmdHelper.updateBusinessObject(element, businessObject, properties);
    };

    var get = function(element, property) {
      var loopCharacteristics = businessObject.get('loopCharacteristics'),
          entity = loopCharacteristics.get(property),
          res = {};

      if(entity) res[property] = entity.body;

      return res;
    };

    // loopCardinality
    group.entries.push(entryFactory.textField({
      id: 'loopCardinality',
      description: '',
      label: 'Loop Cardinality',
      modelProperty: 'loopCardinality',
      set: function(element, values) {
        return modifyBusinessObject(element, 'loopCardinality', values);
      },
      get: function(element) {
        return get(element, 'loopCardinality')
      }
    }));

    // completition Condition
    group.entries.push(entryFactory.textField({
      id: 'completionCondition',
      description: '',
      label: 'Completion Condition',
      modelProperty: 'completionCondition',
      set: function(element, values) {
        return modifyBusinessObject(element, 'completionCondition', values);
      },
      get: function(element) {
        return get(element, 'completionCondition')
      }
    }));

    // camunda:collection
    group.entries.push(entryFactory.textField({
      id: 'collection',
      description: '',
      label: 'Collection',
      modelProperty: 'collection',
      set: function(element, values) {
        var businessObject = getBusinessObject(element).get('loopCharacteristics');

        return cmdHelper.updateBusinessObject(element, businessObject, { collection: values['collection'] });
      },
      get: function(element) {
        var bo = getBusinessObject(element).get('loopCharacteristics');

        return { collection: bo.get('collection')}
      }
    }));

    // AsyncBefore
    group.entries.push(entryFactory.checkbox({
      id: 'loopAsyncBefore',
      description: '',
      label: 'Multi Instance Asynchronous Before',
      modelProperty: 'loopAsyncBefore',
      get: function(element, node) {
        asyncBeforeButton = domQuery('input[name=loopAsyncBefore]', node);

        var bo = getBusinessObject(element).get('loopCharacteristics');
        return { loopAsyncBefore: bo.get('asyncBefore')}
      },
      set: function(element, values) {
        var businessObject = getBusinessObject(element).get('loopCharacteristics');

        var properties = {};
        properties.asyncBefore = !!values.loopAsyncBefore;

        if(!asyncAfterButton.checked && !values.loopAsyncBefore) {
          properties.exclusive = true;
        }

        return cmdHelper.updateBusinessObject(element, businessObject, properties);
      }
    }));

    // AsyncAfter
    group.entries.push(entryFactory.checkbox({
      id: 'loopAsyncAfter',
      description: '',
      label: 'Multi Instance Asynchronous After',
      modelProperty: 'loopAsyncAfter',
      get: function(element, node) {
        asyncAfterButton = domQuery('input[name=loopAsyncAfter]', node);

        var bo = getBusinessObject(element).get('loopCharacteristics');
        return { loopAsyncAfter: bo.get('asyncAfter')}
      },
      set: function(element, values) {
        var businessObject = getBusinessObject(element).get('loopCharacteristics');

        var properties = {};
        properties.asyncAfter = !!values.loopAsyncAfter;

        if(!asyncBeforeButton.checked && !values.loopAsyncAfter) {
          properties.exclusive = true;
        }

        return cmdHelper.updateBusinessObject(element, businessObject, properties);
      }
    }));

    group.entries.push(
      entryFactory.isConditional(entryFactory.checkbox({
        id: 'loopExclusive',
        description: '',
        label: 'Multi Instance Exclusive',
        modelProperty: 'loopExclusive',
        get: function(element) {
          var bo = getBusinessObject(element).get('loopCharacteristics');
          return { loopExclusive: bo.get('exclusive')}
        },
        set: function(element, values) {
          var businessObject = getBusinessObject(element).get('loopCharacteristics');

          return cmdHelper.updateBusinessObject(element, businessObject, {exclusive : !!values['loopExclusive'] });
        }
      }), function(element, node) {
        var asyncBeforeChecked = domQuery('input[name=loopAsyncBefore]', node.parentElement).checked,
            asyncAfterChecked = domQuery('input[name=loopAsyncAfter]', node.parentElement).checked;

        return asyncAfterChecked || asyncBeforeChecked
      }));
  }
};