'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  entryFactory = require('../../../factory/EntryFactory'),
  elementHelper = require('../../../helper/ElementHelper'),
  remove = require('lodash/array/remove');

function removeRetryTimeCycle(res, element, bpmnFactory) {
  var bo = getBusinessObject(element);
  var extensionElements = bo.get('extensionElements');
  if(!!extensionElements) {
    var extensionElementsCopy = elementHelper.createElement('bpmn:ExtensionElements', {}, bo, bpmnFactory);
    extensionElementsCopy.list = extensionElements.values.slice();
    remove(extensionElementsCopy.list, function(element) {
      return typeof element.$instanceOf === 'function' && is(element, 'camunda:FailedJobRetryTimeCycle');
    });
    if(extensionElementsCopy.list.length != extensionElements.values.length) {
      res.extensionElements = extensionElementsCopy;
    }
  }
}

module.exports = function(group, element, bpmnFactory) {
  if (is(element, 'camunda:AsyncCapable')) {
    var asyncAfterButton, asyncBeforeButton;

    // AsyncBefore
    group.entries.push(entryFactory.checkbox({
      id: 'asyncBefore',
      description: '',
      label: 'Asynchronous Before',
      modelProperty: 'asyncBefore',
      get: function(element, node) {
        var bo = getBusinessObject(element);

        // save the current state of the input field
        asyncBeforeButton = domQuery('input[name=asyncBefore]', node);

        return { asyncBefore: bo.get('asyncBefore')};
      },
      set: function(element, values) {
        var res = { asyncBefore: !!values.asyncBefore };

        if(!asyncAfterButton.checked && !values.asyncBefore) {
          res.exclusive = true;
          // remove retry time cycle if it exists
          removeRetryTimeCycle(res, element, bpmnFactory);
        }

        return res;

      }
    }));

    // AsyncAfter
    group.entries.push(entryFactory.checkbox({
      id: 'asyncAfter',
      description: '',
      label: 'Asynchronous After',
      modelProperty: 'asyncAfter',
      get: function(element, node) {
        var bo = getBusinessObject(element);

        // save the current state of the input field
        asyncAfterButton = domQuery('input[name=asyncAfter]', node);

        return { asyncAfter: bo.get('asyncAfter')};
      },
      set: function(element, values) {

        var res = { asyncAfter: !!values.asyncAfter };

        if(!asyncBeforeButton.checked && !values.asyncAfter) {
          res.exclusive = true;

          // remove retry time cycle if it exists
          removeRetryTimeCycle(res, element, bpmnFactory);
        }

        return res;
      }
    }));

    // exclusive
    group.entries.push(
      entryFactory.isConditional(entryFactory.checkbox({
        id: 'exclusive',
        description: '',
        label: 'Exclusive',
        modelProperty: 'exclusive'
      }), function(element, node) {
        var asyncBeforeChecked = domQuery('input[name=asyncBefore]', node.parentElement).checked,
          asyncAfterChecked = domQuery('input[name=asyncAfter]', node.parentElement).checked;

        return asyncAfterChecked || asyncBeforeChecked;
      }));
  }
};