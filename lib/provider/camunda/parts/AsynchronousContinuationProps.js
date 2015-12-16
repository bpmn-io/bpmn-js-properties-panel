'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../../factory/EntryFactory'),
  elementHelper = require('../../../helper/ElementHelper'),
  remove = require('lodash/array/remove');

function removeRetryTimeCycle(res, element, bpmnFactory, isAsyncBefore, isAsyncAfter) {

  if( !isAsyncBefore && !isAsyncAfter ) {
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
}

function resetExclusive(res, isAsyncBefore, isAsyncAfter) {
  if( !isAsyncBefore && !isAsyncAfter ) {
    res.exclusive = true;
  }
}

function isAsyncBefore(bo) {
  // also check deprecated camunda:async attribute
  return ( !!bo.get('camunda:asyncBefore') || !!bo.get('camunda:async') );
}

module.exports = function(group, element, bpmnFactory) {
  if (is(element, 'camunda:AsyncCapable')) {
    var bo = getBusinessObject(element);

    // AsyncBefore
    group.entries.push(entryFactory.checkbox({
      id: 'asyncBefore',
      description: '',
      label: 'Asynchronous Before',
      modelProperty: 'asyncBefore',
      get: function(element, node) {
        var isAsync = isAsyncBefore(bo);

        return { asyncBefore: isAsync };
      },
      set: function(element, values) {
        var asyncBefore = !!values.asyncBefore,
            res = {
              asyncBefore : asyncBefore,
              /*
               HACK: the moddle expects a boolean value and false is the default value which is needed to remove the
               attribute.
               */
              async : false
            };

        // reset exclusive if asyncBefore and asyncAfter are false
        resetExclusive(res, asyncBefore, !!bo.get('asyncAfter'));

        // remove retry time cycle if it exists
        removeRetryTimeCycle(res, element, bpmnFactory, asyncBefore, !!bo.get('asyncAfter'));

        return res;
      }
    }));

    // AsyncAfter
    group.entries.push(entryFactory.checkbox({
      id: 'asyncAfter',
      description: '',
      label: 'Asynchronous After',
      modelProperty: 'asyncAfter',
      set: function(element, values) {
        var asyncAfter = !!values.asyncAfter,
            res = { asyncAfter: asyncAfter };

        // reset exclusive if asyncBefore and asyncAfter are false
        resetExclusive(res, isAsyncBefore(bo), asyncAfter);

        // remove retry time cycle if it exists
        removeRetryTimeCycle(res, element, bpmnFactory, isAsyncBefore(bo), asyncAfter);

        return res;
      }
    }));

    // exclusive
    group.entries.push(
      entryFactory.checkbox({
        id: 'exclusive',
        description: '',
        label: 'Exclusive',
        modelProperty: 'exclusive',
        disabled: function(element, node) {
          var asyncBefore = isAsyncBefore(bo),
              asyncAfter = !!bo.get('camunda:asyncAfter');

          return !( asyncBefore || asyncAfter );
        }
      }));
  }
};