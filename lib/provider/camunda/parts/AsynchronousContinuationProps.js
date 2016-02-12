'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../../factory/EntryFactory'),
  elementHelper = require('../../../helper/ElementHelper'),
  remove = require('lodash/array/remove'),
  cmdHelper = require('../../../helper/CmdHelper');

function removeRetryTimeCycle(res, element, bpmnFactory, isAsyncBefore, isAsyncAfter) {

  if( !isAsyncBefore && !isAsyncAfter ) {
    var bo = getBusinessObject(element);
    var extensionElements = bo.get('extensionElements');
    if( !!extensionElements ) {
      var extensionElementsCopy = elementHelper.createElement('bpmn:ExtensionElements', {}, bo, bpmnFactory);
      extensionElementsCopy.values = extensionElements.values.slice();
      remove(extensionElementsCopy.values, function(element) {
        return typeof element.$instanceOf === 'function' && is(element, 'camunda:FailedJobRetryTimeCycle');
      });
      if( extensionElementsCopy.values.length != extensionElements.values.length ) {
        if( extensionElementsCopy.values.length > 0 ) {
          res.extensionElements = extensionElementsCopy;
        } else {
          res.extensionElements = undefined;
        }
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
            asyncAfter = !!bo.get('camunda:asyncAfter'),
            res = {
              asyncBefore : asyncBefore,
              /*
               HACK: the moddle expects a boolean value and false is the default value which is needed to remove the
               attribute.
               */
              async : false
            };

        // reset exclusive if asyncBefore and asyncAfter are false
        resetExclusive(res, asyncBefore, asyncAfter);

        // remove retry time cycle if it exists
        removeRetryTimeCycle(res, element, bpmnFactory, asyncBefore, asyncAfter);

        return cmdHelper.updateProperties(element, res);
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
            asyncBefore = isAsyncBefore(bo),
            res = { asyncAfter: asyncAfter };

        // reset exclusive if asyncBefore and asyncAfter are false
        resetExclusive(res, asyncBefore, asyncAfter);

        // remove retry time cycle if it exists
        removeRetryTimeCycle(res, element, bpmnFactory, asyncBefore, asyncAfter);

        return cmdHelper.updateProperties(element, res);
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