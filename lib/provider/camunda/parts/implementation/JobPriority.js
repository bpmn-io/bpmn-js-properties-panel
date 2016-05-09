'use strict';

var entryFactory = require('../../../../factory/EntryFactory');

var cmdHelper = require('../../../../helper/CmdHelper');

module.exports = function(element, bpmnFactory, options) {

  var getBusinessObject = options.getBusinessObject;

  var jobPriorityEntry = entryFactory.textField({
    id: 'jobPriority',
    description: 'Priority of a job',
    label: 'Job Priority',
    modelProperty: 'jobPriority',

    get: function(element, node) {
      var bo = getBusinessObject(element);
      return {
        jobPriority: bo.get('camunda:jobPriority')
      };
    },

    set: function(element, values) {
      var bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'camunda:jobPriority': values.jobPriority || undefined
      });
    }

  });

  return [ jobPriorityEntry ];

};