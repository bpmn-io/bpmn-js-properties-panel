'use strict';

var entryFactory = require('../../../../factory/EntryFactory');

var cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function(element, bpmnFactory, options, translate) {

  var getBusinessObject = options.getBusinessObject;

  var externalTaskPriorityEntry = entryFactory.textField({
    id: 'externalTaskPriority',
    label: translate('Task Priority'),
    modelProperty: 'taskPriority',

    get: function(element, node) {
      var bo = getBusinessObject(element);
      return {
        taskPriority: bo.get('camunda:taskPriority')
      };
    },

    set: function(element, values) {
      var bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'camunda:taskPriority': values.taskPriority || undefined
      });
    }

  });

  return [ externalTaskPriorityEntry ];

};
