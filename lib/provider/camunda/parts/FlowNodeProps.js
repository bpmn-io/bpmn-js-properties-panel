'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  entryFactory = require('../../../factory/EntryFactory'),
  forEach = require('lodash/collection/forEach'),
  elementHelper = require('../../../helper/ElementHelper');


module.exports = function(group, element) {
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
        var res = { asyncBefore: !!values['asyncBefore'] };

        if(!asyncAfterButton.checked && !values['asyncBefore']) {
          res.exclusive = true;

          var bo = getBusinessObject(element);
          if(bo.get('extensionElements')) {
            res.extensionElements = elementHelper.removeElement({
              businessObject: bo.get('extensionElements'),
              propertyName: 'values',
              elementType: 'camunda:FailedJobRetryTimeCycle'
            });
          }
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

        var res = { asyncAfter: !!values['asyncAfter'] };

        if(!asyncBeforeButton.checked && !values['asyncAfter']) {
          res.exclusive = true;

          var bo = getBusinessObject(element);
          if(bo.get('extensionElements')) {
            res.extensionElements = elementHelper.removeElement({
              businessObject: bo.get('extensionElements'),
              propertyName: 'values',
              elementType: 'camunda:FailedJobRetryTimeCycle'
            });
          }
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

        return asyncAfterChecked || asyncBeforeChecked
      }));
  }
};